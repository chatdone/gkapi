import { gql, ApolloServer } from 'apollo-server-express';
import schema from '@graphql/schemasMap';
it('returns hello with the provided name', async () => {
  const testServer = new ApolloServer({
    schema,
    context: () => {
      return {
        loaders: {
          getShortUrl: {
            load: () => {
              return {
                url: 'Hello world!',
                short_id: 'aoseunth',
                active: true,
              };
            },
          },
        },
      };
    },
  });

  try {
    const result = await testServer.executeOperation({
      query: gql`
        query ShortUrl($shortId: String!) {
          shortUrl(shortId: $shortId) {
            url
          }
        }
      `,
      variables: { shortId: 'world' },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.shortUrl.url).toBe('Hello world!');
  } catch (error) {
    console.error('error', error);
  }
});
