wget localhost:3000/docs-yaml -O docs/user-api-spec.yaml

npx openapi-generator-cli generate -i docs/user-api-spec.yaml -g typescript-axios -o apps/api-app/user-api-sdk \
    --additional-properties=npmName=user-api-sdk,supportsES6=true

cd apps/api-app/user-api-sdk
npm run prepare
npm pack
