aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/n9t4t7x6

docker build -t mindhub-api --build-arg APPLICATION=api-app ../../..
docker tag mindhub-api:latest public.ecr.aws/n9t4t7x6/mindhub-api:latest
docker push public.ecr.aws/n9t4t7x6/mindhub-api:latest
