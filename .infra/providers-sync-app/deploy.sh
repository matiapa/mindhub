aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws/n9t4t7x6

docker build -t mindhub-providers-sync --build-arg APPLICATION=providers-sync-app ../..
docker tag mindhub-providers-sync:latest public.ecr.aws/n9t4t7x6/mindhub-providers-sync:latest
docker push public.ecr.aws/n9t4t7x6/mindhub-providers-sync:latest
