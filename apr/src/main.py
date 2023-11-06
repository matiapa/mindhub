import sys
sys.path.append(".")

from models.interfaces.model import Model, Text
from models.interfaces.model_factory import ModelFactory
from db import texts_repo, bigfive_repo

import boto3
import json

sqs = boto3.resource('sqs')
personality_queue = sqs.get_queue_by_name(QueueName='personality-requests-queue')
recommendations_queue = sqs.get_queue_by_name(QueueName='recommendation-requests-queue')

print('Loading model...')
model: Model = ModelFactory.get_model("dummy")

print('Listening...')
while True:

    messages = personality_queue.receive_messages(WaitTimeSeconds=10)
    for message in messages:
        try:
            data = json.loads(message.body)
            print(f'Predicting personality for {data["userId"]}')

            texts = list(texts_repo.find({"userId": data["userId"]}))
            print(f'Retrieved {len(texts)} texts')

            texts = list(map(lambda t : Text(t['rawText'], t['language']), texts))

            vec = model.infer(texts)
            print(f'Result: {vec}')

            bigfive_repo.update_one(
                {
                    "_id": data["userId"]
                },
                {
                    "$set": {
                        "o": vec[0],
                        "c": vec[1],
                        "e": vec[2],
                        "a": vec[3],
                        "n": vec[4],
                    }
                },
                upsert=True
            )

            msg = json.dumps({'userId': data['userId']})
            response = recommendations_queue.send_message(MessageBody=msg)
            print(f'FRS Request ID: {response.get("MessageId")}')

            message.delete()
        except Exception as error:
           # TODO: Improve error handling
           print(f'Error: {error}')
           continue