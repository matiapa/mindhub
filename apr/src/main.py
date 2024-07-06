import config
config.load()

import sys
sys.path.append(".")

from interfaces.model import Model, Text
from interfaces.model_factory import ModelFactory
from db import texts_repo, bigfive_repo

import boto3
import json
import os
from datetime import datetime

sqs = boto3.resource('sqs')
personality_queue = sqs.get_queue_by_name(QueueName=os.environ.get("PERSONALITY_QUEUE_NAME"))
recommendations_queue = sqs.get_queue_by_name(QueueName=os.environ.get("RECOMMENDATIONS_QUEUE_NAME"))

print(f'Loading model {os.environ.get("INFER_MODEL")}...')
model: Model = ModelFactory.get_model(os.environ.get("INFER_MODEL"))

print('Listening...')
while True:

    messages = personality_queue.receive_messages(WaitTimeSeconds=10)
    for message in messages:
        try:
            data = json.loads(message.body)
            print(f'Recieved request for {data["userId"]}')

            # Check if the user was processed recently

            current_personality = bigfive_repo.find_one({"userId": data["userId"]})
            if current_personality is not None and "generatedAt" in current_personality:
                generated_at = current_personality["generatedAt"]
                minimum_waittime = int(os.environ.get("REQUESTS_WAITTIME_MINS"))
                actual_waittime = int((datetime.now() - generated_at).total_seconds() / 60)
                
                # If it was processed in the last 24 hours, skip
                if actual_waittime < minimum_waittime:
                    print(f'Skipping {data["userId"]} since last request was {actual_waittime} minutes ago.')
                    message.delete()
                    continue

            # Proceed with processing

            texts = list(texts_repo.find({"userId": data["userId"]}))
            print(f'Retrieved {len(texts)} texts - Word count: {sum(map(lambda t : len(t["rawText"].split()), texts))}')

            texts = list(map(lambda t : Text(t['rawText'], t['language']), texts))

            vec = model.infer(texts)
            print(f'Result: {vec}')

            bigfive_repo.delete_one({"userId": data["userId"]})

            res = bigfive_repo.insert_one({
                "userId": data["userId"],
                "o": vec[0],
                "c": vec[1],
                "e": vec[2],
                "a": vec[3],
                "n": vec[4],
                "generatedAt": datetime.now()
            })

            msg = json.dumps({'userId': data['userId']})
            response = recommendations_queue.send_message(MessageBody=msg)
            print(f'FRS Request ID: {response.get("MessageId")}')

            message.delete()
        except Exception as error:
           print(f'Error: {error}')
           continue