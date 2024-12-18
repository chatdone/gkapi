import * as AWS from 'aws-sdk';

const client = new AWS.SecretsManager({
  region: 'ap-southeast-1',
});

const getSecretValue = async (secretName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    client.getSecretValue({ SecretId: secretName }, function (err, data) {
      try {
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
            const secret = data.SecretString as string;
            resolve(secret);
          } else {
            // @ts-ignore
            const buff = Buffer.from(data.SecretBinary, 'base64');
            const decodedBinarySecret = buff.toString('ascii');
            resolve(decodedBinarySecret);
          }
        }
      } catch (error) {
        console.log('error');
        reject(error);
      }
    });
  });
};

export { getSecretValue };
