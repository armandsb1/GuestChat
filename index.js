const platformClient = require('purecloud-guest-chat-client');
const client = platformClient.ApiClient.instance;
const WebSocket = require('ws');

client.setEnvironment(platformClient.PureCloudRegionHosts.eu_central_1);
let chatInfo, socket;

// Create API instance
const webChatApi = new platformClient.WebChatApi();


const createChatBody = {
  organizationId: '0b64ef26-3681-4cbf-9675-9154ddc0456a',
  deploymentId: 'a8a8700e-ed11-4163-b872-62706fd62c87',
  routingTarget: {
    targetType: 'QUEUE',
    targetAddress: 'Test queue',
  },
  memberInfo: {
    displayName: 'JavaScript Guest',
    profileImageUrl: 'http://yoursite.com/path/to/guest/image.png',
    customFields: {
      firstName: 'John', 
      lastName: 'Doe'
    }
  }
};

// Create chat
webChatApi.postWebchatGuestConversations(createChatBody)
  .then((createChatResponse) => {
    console.log('Chat created!', createChatResponse);
    // Store chat info
    chatInfo = createChatResponse;

    // Set JWT
    client.setJwt(chatInfo.jwt);

    // Connect to notifications
    socket = new WebSocket(chatInfo.eventStreamUri);

    // Connection opened
    socket.addEventListener('open', function (event) {
      console.log('WebSocket connected');
    });

    // Listen for messages
    socket.addEventListener('message', function (event) {
      const message = JSON.parse(event.data);

      // Chat message
      if (message.metadata) {
        switch(message.metadata.type) {
          case 'message': {
            console.log('Message received: ' + JSON.stringify(message));
            // Handle message from member
            break;
          }
          case 'member-change': {
            // Handle member state change
            break;
          }
          default: {
            console.log('Unknown message type: ' + message.metadata.type);
          }
        }
      }

    });
  })
  .catch(console.error);
  