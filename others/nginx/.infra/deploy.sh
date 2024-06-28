aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/s3y9y4j4

docker build -t nginx --build-arg nginx
docker tag nginx:latest public.ecr.aws/s3y9y4j4/nginx:latest
docker push public.ecr.aws/s3y9y4j4/nginx:latest
