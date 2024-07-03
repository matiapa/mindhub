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
            print(f'Predicting personality for {data["userId"]}')

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
            })

            msg = json.dumps({'userId': data['userId']})
            response = recommendations_queue.send_message(MessageBody=msg)
            print(f'FRS Request ID: {response.get("MessageId")}')

            message.delete()
        except Exception as error:
           print(f'Error: {error}')
           continue