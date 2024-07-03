import os
from dotenv import load_dotenv

def load():
    load_dotenv('.env')
    environment = os.environ.get('ENVIRONMENT', 'local')

    print(f"Loading config with environment = {environment}...")
    load_dotenv(f'envs/.env.{environment}')
    load_dotenv('envs/.env.default')
