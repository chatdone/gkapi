// import MessagingService from '.';
// import { parseMoney } from '@utils/index';

// jest.mock('twilio');
describe('placeholder', () => {
  test('should be a placeholder', async () => {
    expect(true).toBe(true);
  });
});

// describe('messaging.service.js', () => {
//   describe('createCollectionCreatedMessage', () => {
//     test('it should return created message with create sms', async () => {
//       const paymentType = 1;
//       const messageType = 'sms';
//       const mockData = {
//         picName: 'Gelato',
//         companyName: 'Company Name',
//         type: 'overdue',
//         title: 'title',
//         refNo: '012345',
//         payableAmount: 5,
//         period: '4',
//         link: 'https://google.com'
//       };

//       let createdMessage;
//       if (messageType === 'sms') {
//         createdMessage = `Hi ${mockData.picName}, ${
//           mockData.companyName
//         } has just created a ${mockData.type} payment invoice as per below:

//         Payment Title: ${mockData.title}
//         Invoice number: ${mockData.refNo}
//         Invoice amount: RM${parseMoney(mockData.payableAmount)}
//         ${
//           mockData.period !== '-' ? `Instalment Period: ${mockData.period}` : ''
//         }
//         ${
//           paymentType === 1
//             ? 'Please click on the link to view and make payment for your invoice:'
//             : 'Please click on the link to view your invoice:'
//         } ${mockData.link}`;
//       }

//       const res = await MessagingService.createCollectionCreatedMessage(
//         paymentType,
//         messageType,
//         mockData
//       );

//       expect(res).toBe(createdMessage);
//     });

//     test('it should return created message with create whatsapp', async () => {
//       const paymentType = 1;
//       const messageType = 'whatsapp';
//       const mockData = {
//         picName: 'Gelato',
//         companyName: 'Company Name',
//         type: 'overdue',
//         title: 'title',
//         refNo: '012345',
//         payableAmount: 5,
//         period: '4',
//         link: 'https://google.com'
//       };

//       let createdMessage;
//       if (messageType === 'whatsapp') {
//         createdMessage = `Hi ${mockData.picName}, *${
//           mockData.companyName
//         }* has just created a ${mockData.type} payment invoice as per below:

//        Payment Title: *${mockData.title}*
//        Invoice number: *${mockData.refNo}*
//        Invoice amount: *RM${parseMoney(mockData.payableAmount)}*
//        Instalment period: *${mockData.period}*

//        Please click on the link to view your invoice: ${mockData.link}`;
//       }

//       const res = await MessagingService.createCollectionCreatedMessage(
//         paymentType,
//         messageType,
//         mockData
//       );

//       expect(res).toBe(createdMessage);
//     });
//   });

//   describe('createCollectionReminderMessage', () => {
//     test('it should return created message with create sms', async () => {
//       const paymentType = 1;
//       const messageType = 'sms';
//       const mockData = {
//         picName: 'Gelato',
//         companyName: 'Company Name',
//         type: 'overdue',
//         title: 'title',
//         refNo: '012345',
//         amount: 5,
//         period: '4',
//         link: 'https://google.com'
//       };

//       let createdMessage;
//       if (messageType === 'sms') {
//         createdMessage = `Hi ${mockData.picName}, this is to inform you that ${mockData.refNo} from ${mockData.companyName} is ${mockData.dueType}.

//       Payment Title: ${mockData.title}
//       Invoice number: ${mockData.refNo}
//       Invoice amount: RM${mockData.amount}
//       Instalment period: ${mockData.period}

//       Please click ${mockData.link} to upload payment proof. If payment has been made please disregard this message, thank you.`;
//       }

//       const res = await MessagingService.createCollectionReminderMessage(
//         paymentType,
//         messageType,
//         mockData
//       );

//       expect(res).toBe(createdMessage);
//     });

//     test('it should return created message with create whatsapp', async () => {
//       const paymentType = 1;
//       const messageType = 'whatsapp';
//       const mockData = {
//         picName: 'Gelato',
//         companyName: 'Company Name',
//         type: 'overdue',
//         title: 'title',
//         refNo: '012345',
//         amount: 5,
//         period: '4',
//         link: 'https://google.com',
//         dueType: 'overdue'
//       };

//       let createdMessage;
//       if (messageType === 'whatsapp') {
//         createdMessage = `Hi ${mockData.picName}, this is to inform you that *${mockData.refNo}* from *${mockData.companyName}* is ${mockData.dueType}.

//       Payment Title: *${mockData.title}*
//       Invoice number: *${mockData.refNo}*
//       Invoice amount: *RM${mockData.amount}*
//       Instalment period: *${mockData.period}*

//       Please click ${mockData.link} to upload payment proof. If payment has been made please disregard this message, thank you.`;
//       }

//       const res = await MessagingService.createCollectionReminderMessage(
//         paymentType,
//         messageType,
//         mockData
//       );

//       expect(res).toBe(createdMessage);
//     });
//   });
// });
