import { registerRootComponent } from 'expo';

import App from './App';
import {WalletScreen} from './src/screens/WalletScreen'

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
//registerRootComponent(WalletScreen);
registerRootComponent(App);
