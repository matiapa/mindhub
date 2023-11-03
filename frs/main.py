import boto3
import json
from global_affinity import calculate_recommendations
from dotenv import load_dotenv

load_dotenv()

sqs = boto3.resource('sqs')
queue = sqs.get_queue_by_name(QueueName='recommendation-queue')

while True:

    messages = queue.receive_messages()
    for message in messages:
        try:
            data = json.loads(message.body)
            userId = data['userId']

            print(f'Calculating affinities for user {userId}')

            affinities = calculate_recommendations(userId)

            print(f'{len(affinities)} affinities calculated')
            
            message.delete()
        except Exception as error:
            print(error)
            continue