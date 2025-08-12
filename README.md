# Live Cross-Device Messaging App

This React Native app now supports live cross-device messaging and user discovery.

## Features

### 🌐 Cross-Device User Discovery
- Users created on any device are discoverable by others
- Cloud-based user storage with local fallback
- Real-time search across all registered users
- Profile viewing for users from different devices

### 💬 Live Messaging
- Real-time message synchronization across devices
- Live connection status indicators
- Automatic message polling every 2-3 seconds
- Offline/online status display
- Cross-device conversation persistence

### 🔄 Sync System
- Background sync when app is active
- Faster sync in active chat (2 seconds)
- Regular sync in messages list (5 seconds)
- Global sync for user discovery (3 seconds)
- Automatic fallback to local storage

## How It Works

### User Storage
1. **Cloud Storage**: Users are stored in a cloud database using AI-powered storage
2. **Local Fallback**: If cloud is unavailable, uses local AsyncStorage
3. **Cross-Device Sync**: Users created on one device appear on others

### Live Messaging
1. **Message Storage**: Messages stored both in cloud and locally
2. **Real-time Sync**: Automatic polling for new messages
3. **Connection Status**: Visual indicators show live/offline status
4. **Conversation Management**: Conversations sync across devices

### Usage
1. Create an account on any device
2. Search for other users by name, email, or university
3. Start conversations with real users
4. Messages appear live on both devices
5. Switch between devices and continue conversations

## Technical Implementation

- **Cloud Backend**: Uses AI-powered storage API for cross-device data
- **Local Storage**: AsyncStorage for offline functionality
- **Real-time Updates**: Polling-based sync system
- **State Management**: React Context with custom hooks
- **Type Safety**: Full TypeScript implementation

The app now provides a complete live messaging experience where users can discover each other across devices and have real-time conversations!