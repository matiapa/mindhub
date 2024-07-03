import config
config.load()

from datetime import datetime, timezone
import pprint
import time
from openai import OpenAI
from db import users, messages, personalities
import os

# Create the OpenAI client

client = OpenAI(
    api_key=os.environ.get("OPENAI_SECRET_KEY"),
)

# Get the list of bot users

bot_users = users.distinct('_id', {'isFake': True})
print(f'Bot users f{bot_users}\n')

print('Listening...\n')
while True:
    new_messages = list(messages.find({
        'receiver': {'$in': bot_users},
        '$or': [{'processed': {'$exists': False}}, {'processed': False}]
    }))

    for message in new_messages:
        try:
            pers = personalities.find_one({'userId': message['receiver']})
            pers = {"o": round(pers['o']*5), "c": round(pers['c']*5), "e": round(pers['e']*5), "a": round(pers['a']*5), "n": round(pers['n']*5)}

            text = message['text'][:int(os.getenv('MAX_USER_MESSAGE_LENGTH'))]

            print("Processing message")
            pprint.pprint({
                'sender': message['sender'],
                'receiver': message['receiver'],
                'personality': {"o": pers['o'], "c": pers['c'], "e": pers['e'], "a": pers['a'], "n": pers['n']},
                'text': text,
                'temperature': os.getenv('BOT_ANSWER_TEMPERATURE')
            })

            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a human with the following Big Five traits (in a scale from 1 to 5): \n" \
                            f"Openness: {pers['o']} Conscientiousness: {pers['c']}, Extraversion: {pers['e']}, Agreeableness: {pers['a']}, Neuroticism: {pers['n']}",
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
                'sender': message['receiver'],
                'receiver': message['sender'],
                'text': response,
                'createdAt': datetime.now(timezone.utc),
            })

            messages.update_one({'_id': message['_id']}, {'$set': {'processed': True}})

            print(f"Answered: {response}")
        except Exception as error:
            print(f'Error: {error}')
            continue

    polling_time = int(os.getenv('POLLING_TIME'))
    time.sleep(polling_time)
