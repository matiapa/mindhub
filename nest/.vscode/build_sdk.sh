docker run --rm -v "${PWD}:/local" openapitools/openapi-generator-cli generate \
   -i local/docs/user-api-spec.yaml \
   -g typescript-axios \
   -o local/apps/api-app/user-api-sdk \
   --additional-properties=npmName=user-api-sdk

cd apps/api-app/user-api-sdk
npm prepare
npm pack
