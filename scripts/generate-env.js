// Load the AWS SDK
var dayjs = require('dayjs');
var dotenv = require('dotenv');
var fs = require('fs');
var _ = require('lodash');
var AWS = require('aws-sdk');
dotenv.config();

var region = 'ap-southeast-1';
var secret;
var decodedBinarySecret;

// Create a Secrets Manager client
var client = new AWS.SecretsManager({
  region,
});

// In this sample we only handle the specific exceptions for the 'GetSecretValue' API.
// See https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
// We rethrow the exception by default.
try {
  client.getSecretValue(
    { SecretId: process.env.SECRETS_ARN },
    function (err, data) {
      if (err) {
        if (err.code === 'DecryptionFailureException')
          // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
          // Deal with the exception here, and/or rethrow at your discretion.
          throw err;
        else if (err.code === 'InternalServiceErrorException')
          // An error occurred on the server side.
          // Deal with the exception here, and/or rethrow at your discretion.
          throw err;
        else if (err.code === 'InvalidParameterException')
          // You provided an invalid value for a parameter.
          // Deal with the exception here, and/or rethrow at your discretion.
          throw err;
        else if (err.code === 'InvalidRequestException')
          // You provided a parameter value that is not valid for the current state of the resource.
          // Deal with the exception here, and/or rethrow at your discretion.
          throw err;
        else if (err.code === 'ResourceNotFoundException')
          // We can't find the resource that you asked for.
          // Deal with the exception here, and/or rethrow at your discretion.
          throw err;
      } else {
        // Decrypts secret using the associated KMS CMK.
        // Depending on whether the secret is a string or binary, one of these fields will be populated.
        if ('SecretString' in data) {
          secret = data.SecretString;

          const parsed = JSON.parse(secret);
          console.log(parsed);
          let content = `# Generated on ${dayjs()}\n\n`;

          _.each(parsed, (value, key) => {
            if (
              process.env.NODE_ENV === 'development' &&
              key.includes('PRODUCTION')
            ) {
              content += `${key}='${process.env[key]}'\n`;
            } else {
              content += `${key}='${value}'\n`;
            }
          });
          content += `\n\nSECRETS_ARN='${process.env.SECRETS_ARN}'\n`;

          const oldEnv = fs.readFileSync('./.env', 'utf8');
          fs.writeFileSync(`./.env.${dayjs().unix()}.backup`, oldEnv);

          fs.writeFileSync('./.env', content);
          console.log('.env file generated');
        } else {
          let buff = new Buffer(data.SecretBinary, 'base64');
          decodedBinarySecret = buff.toString('ascii');
          console.log(decodedBinarySecret);
          console.log('not handled');
        }
      }

      // Your code goes here.
    },
  );
} catch (error) {
  console.log('error', error);
}
