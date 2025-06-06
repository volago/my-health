# my-health-firebase-app

This Nx Firebase application was generated by [@simondotm/nx-firebase](https://github.com/simondotm/nx-firebase).

## Generated Application Files

* `database.rules.json` - Default Firebase Realtime Database Rules
* `firestore.indexes.json` - Default Firebase Firestore Database Rules
* `storage.rules` - Default Firebase Storage Rules
* `public/index.ts` - Default Firebase hosting site

## Generated Workspace Root Files

* `firebase.json` - Firebase CLI Configuration for this project
* `.firebaserc` - Default Firebase CLI Deployment Targets Configuration

## Generated dependencies

Nx-Firebase will add `firebase-tools`, `firebase-admin` and `firebase-functions` to your workspace if they do not already exist.

## Next Steps

* Read about the [Firebase CLI here](https://firebase.google.com/docs/cli)
* `firebase login` - Authenticate the Firebase CLI
* `firebase use --add` - Add your Firebase Project as a target to `.firebaserc`
* `nx g @simondotm/nx-firebase:function my-function --firebaseApp my-health-firebase-app` - Add a firebase function to this project

See the plugin [README](https://github.com/simondotm/nx-firebase/blob/main/README.md) for more information.

## Commands

* `nx run my-health-firebase-app:deploy` - Deploy this app to firebase
* `nx run my-health-firebase-app:serve` - Serve this app using the firebase emulator
* `nx run my-health-firebase-app:build` - Build all functions associated with this app
* `nx run my-health-firebase-app:test` - Test all functions associated with this app
* `nx run my-health-firebase-app:lint` - Lint all functions associated with this app



