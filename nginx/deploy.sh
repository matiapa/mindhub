aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/n9t4t7x6

docker build -t nginx --build-arg nginx
docker tag nginx:latest public.ecr.aws/n9t4t7x6/nginx:latest
docker push public.ecr.aws/n9t4t7x6/nginx:latest
