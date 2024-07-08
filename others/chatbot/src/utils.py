import datetime
import json
import os
from db import notificationSubscriptions
from pywebpush import webpush

def send_webpush_event(user_id, payload):
    # print("Sending webpush event", payload)

    subscription_docs = list(notificationSubscriptions.find({"userId": user_id}))

    for subscription_doc in subscription_docs:
        webpush_subscription_doc = subscription_doc["webPushSubscription"]

        response = webpush(
            subscription_info=webpush_subscription_doc,
            data=json.dumps(payload),
            vapid_private_key=os.getenv("NOTIFICATIONS_VAPID_PRIVATE_KEY"),
            vapid_claims={
                "sub": os.getenv("NOTIFICATIONS_VAPID_SUBJECT"),
            }
        )

        # print("Succesfully sent webpush event", response)

def find_first(lst, predicate):
    return next((element for element in lst if predicate(element)), None)

def serialize_datetime(obj): 
    if isinstance(obj, datetime.datetime): 
        return obj.isoformat() 
    raise TypeError("Type not serializable")
