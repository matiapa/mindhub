import config
config.load()

from datetime import datetime, timezone
import pprint
import time
from openai import OpenAI
from db import users, messages, personalities, friendships, notifications
import os
from utils import find_first, send_webpush_event

# ----------------------------------------------------------------------------------------------------------------

# Create the OpenAI client

client = OpenAI(
    api_key=os.environ.get("OPENAI_SECRET_KEY"),
)

# Get the list of bot users

bot_users = list(users.find({'isFake': True}))
bot_users_ids = [user['_id'] for user in bot_users]

# ----------------------------------------------------------------------------------------------------------------

def process_messages():
    new_messages = list(messages.find({
        'receiver': {'$in': bot_users_ids},
        '$or': [{'processed': {'$exists': False}}, {'processed': False}]
    }))

    for message in new_messages:
        try:
            bot_id = message['receiver']
            user_id = message['sender']

            # ---------------------- Create the system message for GPT ----------------------

            bot_pers = personalities.find_one({'userId': bot_id})
            bot_pers = {"o": round(bot_pers['o']*5), "c": round(bot_pers['c']*5), "e": round(bot_pers['e']*5), "a": round(bot_pers['a']*5), "n": round(bot_pers['n']*5)}

            system_message = {
                "role": "system",
                "content": os.getenv('GPT_SYSTEM_PROMPT').format(
                    o=bot_pers['o'], c=bot_pers['c'], e=bot_pers['e'], a=bot_pers['a'], n=bot_pers['n']
                )
            }
                            
            gpt_messages = [system_message]
                            

            # ---------------------- Create the user and assistant messages for GPT ----------------------

            chat_messages = messages.find({
                "$or": [
                    {"sender": user_id, "receiver": bot_id},
                    {"sender": bot_id, "receiver": user_id}
                ]
            }).sort("createdAt", 1)

            chat_messages = list(map(lambda m: {
                'role': 'user' if m['sender'] == user_id else 'assistant',
                'content': m['text'][:int(os.getenv('MAX_USER_MESSAGE_LENGTH'))]
            }, chat_messages))

            gpt_messages += chat_messages

            #  ---------------------- Process the message ----------------------

            print("Processing message")
            pprint.pprint({
                'sender': user_id,
                'receiver': bot_id,
                'personality': {"o": bot_pers['o'], "c": bot_pers['c'], "e": bot_pers['e'], "a": bot_pers['a'], "n": bot_pers['n']},
                'text': chat_messages[-1]['content'],
                'temperature': os.getenv('BOT_ANSWER_TEMPERATURE')
            })

            chat_completion = client.chat.completions.create(
                messages=gpt_messages,
                model="gpt-3.5-turbo",
                max_tokens=int(os.getenv('MAX_BOT_RESPONSE_LENGTH')),
                temperature=float(os.getenv('BOT_ANSWER_TEMPERATURE')),
            )

            response = chat_completion.choices[0].message.content

            # ---------------------- Save the response and mark message as processed ----------------------

            insert_result = messages.insert_one({
                'sender': bot_id,
                'receiver': user_id,
                'text': response,
                'createdAt': datetime.now(timezone.utc),
            })

            messages.update_one({'_id': message['_id']}, {'$set': {'processed': True}})

            # ---------------------- Notify the user about the message ----------------------

            bot_user = find_first(bot_users, lambda user: user['_id'] == bot_id)

            send_webpush_event(user_id, {
                "eventType": "new_chat_message",
                "eventPayload": {
                    "_id": str(insert_result.inserted_id),
                    "sender": bot_id,
                    "senderName": bot_user["profile"]["name"],
                    "receiver": user_id,
                    "text": response,
                    "createdAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                }
            })

            print(f"Answered: {response}")
        except Exception as error:
            print(f'Error: {error}')
            continue

def process_friendship_requests():
    find_filter = {
        'target': {'$in': bot_users_ids},
        'status': 'pending'
    }

    requests = list(friendships.find(find_filter))

    # ---------------------- Accept the requests ----------------------

    update_result = friendships.update_many(find_filter, {
        '$set': {'status': 'accepted'}
    })

    if update_result.modified_count > 0:
        print(f'Accepted {update_result.modified_count} friendship requests\n')

    # ---------------------- Notify the users about the accepted requests ----------------------

    for request in requests:
        try:
            user_id = request['proposer']
            bot_id = request['target']
            bot_user = find_first(bot_users, lambda user: user['_id'] == bot_id)

            notification = {
                "targetUserId": user_id,
                "type": "accepted_friendship_proposal",
                "payload": {
                    "counterpartyId": bot_id,
                    "counterpartyName": bot_user["profile"]["name"],
                },
                "seen": False,
                "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }

            notifications.insert_one(notification)
            notification["_id"] = str(notification["_id"])

            send_webpush_event(user_id, {
                "eventType": "new_app_notification",
                "eventPayload": notification
            })

        except Exception as error:
            print(f'Error: {error}')
            continue

# ----------------------------------------------------------------------------------------------------------------

print('Listening...\n')
while True:
    if os.getenv('ENABLED') == 'true':
        process_messages()

        process_friendship_requests()

    polling_time = int(os.getenv('POLLING_TIME'))
    time.sleep(polling_time)
