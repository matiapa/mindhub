import config
config.load()

from datetime import datetime, timezone
import pprint
import time
from openai import OpenAI
from db import users, messages, personalities, friendships, notifications
import os

# ----------------------------------------------------------------------------------------------------------------

# Create the OpenAI client

client = OpenAI(
    api_key=os.environ.get("OPENAI_SECRET_KEY"),
)

# Get the list of bot users

bot_users = list(users.find({'isFake': True}))
bot_users_ids = [user['_id'] for user in bot_users]
print(f'Bot users {bot_users_ids}\n')

# ----------------------------------------------------------------------------------------------------------------

def find_first(lst, predicate):
    return next((element for element in lst if predicate(element)), None)

def process_messages():
    new_messages = list(messages.find({
        'receiver': {'$in': bot_users_ids},
        '$or': [{'processed': {'$exists': False}}, {'processed': False}]
    }))

    for message in new_messages:
        try:
            bot_id = message['receiver']

            bot_pers = personalities.find_one({'userId': bot_id})
            bot_pers = {"o": round(bot_pers['o']*5), "c": round(bot_pers['c']*5), "e": round(bot_pers['e']*5), "a": round(bot_pers['a']*5), "n": round(bot_pers['n']*5)}

            bot_user = find_first(bot_users, lambda user: user['_id'] == bot_id)

            text = message['text'][:int(os.getenv('MAX_USER_MESSAGE_LENGTH'))]

            print("Processing message")
            pprint.pprint({
                'sender': message['sender'],
                'receiver': bot_id,
                'personality': {"o": bot_pers['o'], "c": bot_pers['c'], "e": bot_pers['e'], "a": bot_pers['a'], "n": bot_pers['n']},
                'text': text,
                'temperature': os.getenv('BOT_ANSWER_TEMPERATURE')
            })

            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a human with the following Big Five traits (in a scale from 1 to 5): \n" \
                            f"Openness: {bot_pers['o']} Conscientiousness: {bot_pers['c']}, Extraversion: {bot_pers['e']}, Agreeableness: {bot_pers['a']}, Neuroticism: {bot_pers['n']}",
                    },
                    {
                        "role": "user",
                        "content": text,
                    }
                ],
                model="gpt-3.5-turbo",
                max_tokens=int(os.getenv('MAX_BOT_RESPONSE_LENGTH')),
                temperature=float(os.getenv('BOT_ANSWER_TEMPERATURE')),
            )

            response = chat_completion.choices[0].message.content

            messages.insert_one({
                'sender': bot_id,
                'receiver': message['sender'],
                'text': response,
                'createdAt': datetime.now(timezone.utc),
            })

            messages.update_one({'_id': message['_id']}, {'$set': {'processed': True}})

            notifications.insert_one({
                "targetUserId": message['sender'],
                "type": "new_message",
                "payload": {
                    "senderName": bot_user["profile"]["name"],
                    "message": text,
                },
                "seen": False,
                "date": datetime.now()
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

    for request in requests:
        try:
            bot_user = find_first(bot_users, lambda user: user['_id'] == request['target'])

            notifications.insert_one({
                "targetUserId": request['proposer'],
                "type": "accepted_friendship_proposal",
                "payload": {
                    "counterpartyName": bot_user["profile"]["name"],
                },
                "seen": False,
                "date": datetime.now()
            })
        except Exception as error:
            print(f'Error: {error}')
            continue

    update_result = friendships.update_many(find_filter, {
        '$set': {'status': 'accepted'}
    })

    if update_result.modified_count > 0:
        print(f'Accepted {update_result.modified_count} friendship requests\n')

# ----------------------------------------------------------------------------------------------------------------

print('Listening...\n')
while True:
    if os.getenv('ENABLED') == 'true':
        process_messages()

        process_friendship_requests()

    polling_time = int(os.getenv('POLLING_TIME'))
    time.sleep(polling_time)
