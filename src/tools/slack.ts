import axios from 'axios';

const webhookUrls = {
  email:
    process.env.SLACK_WEBHOOK_EMAIL ||
    'https://hooks.slack.com/services/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',
  stripe:
    process.env.SLACK_WEBHOOK_STRIPE ||
    'https://hooks.slack.com/services/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',
};

const postToSlack = async (payload: unknown): Promise<void> => {
  await axios.post(webhookUrls.email, payload);
};

const postToDevLog = async (
  name: string,
  error: unknown,
  message?: unknown,
): Promise<void> => {
  postToSlack({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${name} failed, env: ${
            process.env.GK_ENVIRONMENT
          }, node_env: ${process.env.NODE_ENV}
            \`\`\`${JSON.stringify(error)}\`\`\`
            ${message && `\`\`\`${JSON.stringify(message)}\`\`\``}`,
        },
      },
    ],
  });

  return;
};

const postChannelStripe = async (payload: unknown): Promise<void> => {
  await axios.post(webhookUrls.stripe, {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: JSON.stringify(payload),
        },
      },
    ],
  });
};

export default {
  postToSlack,
  postChannelStripe,

  postToDevLog,
};
