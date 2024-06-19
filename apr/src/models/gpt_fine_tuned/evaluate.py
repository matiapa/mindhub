from openai import OpenAI
import re
import json
from sklearn.metrics import mean_squared_error
import numpy as np
import os
import dotenv

dotenv.load_dotenv()

client = OpenAI(
    api_key=os.environ.get("OPENAI_SECRET_KEY"),
)

def predict(text):
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": text,
            }
        ],
        model="ft:gpt-3.5-turbo-0125:personal:bigfive-disc:9bBdDQuj",
        max_tokens=50,
        temperature=0
    )
    response = chat_completion.choices[0].message.content

    matches = re.findall(r'\b\d+\b', response)
    return list(map(int, matches))

# data = []
# with open("models/gpt-tune/data/fine_tuning_disc_test.jsonl", 'r') as file:
#     for line in file:
#         data.append(json.loads(line))

# predicted_vecs, actual_vecs = [], []
# for sample in data:
#     text = sample["messages"][0]["content"]
#     predicted_vec = predict(text)
#     predicted_vecs.append(predicted_vec)

#     matches = re.findall(r'\b\d+\b', sample['messages'][1]['content'])
#     actual_vec = list(map(int, matches))
#     actual_vecs.append(actual_vec)

#     print(f"Predicted: {predicted_vec} | Actual: {actual_vec}")

# predicted_vecs = np.array(predicted_vecs)
# actual_vecs = np.array(actual_vecs)

predicted_vecs = np.array([[5, 4, 3, 4, 2], [4, 4, 3, 4, 2], [4, 4, 3, 4, 3], [4, 4, 3, 4, 2], [4, 4, 4, 3, 2], [4, 3, 3, 4, 2], [4, 4, 3, 4, 2], [4, 3, 2, 4, 4], [4, 3, 2, 4, 3], [4, 3, 2, 3, 3], [4, 4, 3, 4, 2], [4, 3, 3, 4, 2], [4, 4, 3, 4, 2], [4, 4, 4, 4, 2], [4, 3, 3, 3, 4], [4, 3, 2, 4, 3], [5, 4, 4, 4, 2], [4, 3, 3, 4, 2], [4, 4, 4, 4, 2], ])
actual_vecs = np.array([[5, 4, 4, 4, 1], [4, 4, 4, 3, 2], [4, 4, 3, 4, 3], [5, 3, 2, 3, 3], [5, 4, 4, 3, 2], [5, 4, 5, 3, 3], [4, 3, 3, 4, 2], [4, 5, 1, 3, 5], [4, 4, 4, 4, 2], [3, 3, 2, 4, 3], [4, 4, 3, 3, 3], [4, 4, 4, 4, 3], [4, 4, 4, 4, 2], [4, 4, 3, 3, 4], [4, 2, 3, 3, 4], [5, 4, 3, 3, 2], [5, 4, 4, 4, 3], [5, 3, 4, 3, 2], [2, 5, 3, 4, 3], ])

avg_abs_error_by_trait = np.mean(abs(predicted_vecs - actual_vecs), axis=0)
print(avg_abs_error_by_trait)

avg_rel_error_by_trait = np.mean(abs(predicted_vecs - actual_vecs) / actual_vecs, axis=0)
print(avg_rel_error_by_trait)

avg_distance = np.mean(np.sqrt(np.sum((predicted_vecs - actual_vecs) ** 2, axis=1)))
print(avg_distance)
