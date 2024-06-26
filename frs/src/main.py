import boto3
import json
import os
from global_affinity import generate_recommendations
from dotenv import load_dotenv

load_dotenv()

sqs = boto3.resource('sqs')
queue = sqs.get_queue_by_name(QueueName=os.environ.get("RECOMMENDATIONS_QUEUE_NAME"))

print('Listening...')
while True:

    messages = queue.receive_messages()
    for message in messages:
        try:
            data = json.loads(message.body)
            userId = data['userId']

            print(f'Generating recommendations for user {userId}')

            recommendations = generate_recommendations(userId)

            print(f'Generated {len(recommendations)} recommendations')
            
            message.delete()
        except Exception as error:
            print(f'Error: {error}')
            continue