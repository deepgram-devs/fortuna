# Fortuna

This is an Electron application that provides access to Deepgram's Voice Agent as a desktop application.

We currently build and distribute a binary for Linux which should be distro-agnostic.

## Installation

Grab the latest `release.zip` release from the Releases tab. Extract the archive and copy the contents to `~/.fortuna`.

Then, create a `~/.local/share/applications/fortuna.desktop` file and copy the contents of our `fortuna.desktop` file in this repository.

You can then launch Fortuna through your favourite application launcher!

## Usage

The first time you use the application, you will need to configure your API key and agent settings.

> [!TIP]
> Need an API key? Sign up for one at https://deepgram.com

Once you have configured these, you can click "Start Agent" to load the interface. Click "Connect" to connect to the agent and begin conversing.

## Development

> [!WARNING]
> Currently our browser-agent orb is NOT published for distribution. To successfully install the dependencies, you will need to package the source manually and copy it to your cloned repository.
>
> Reach out to Naomi if you have questions.

Clone this repository, then `cd` into your cloned directory.

Run `npm install` to install the dependencies.

> [!CAUTION]
> Do NOT use another package manager, such as `yarn` or `pnpm`. The way these package managers link dependencies may impact the build process.

Then run `npm run dev` to start the development server. The development server will:

- Launch the Angular dev server on port 4200
- Launch an Electron app with `dev.js`, which enables the menu and developer tools.

This server can live-reload, so changes made to the source code will be reflected. Note that some changes, such as CSS, may require a page refresh.

## Compiling

To build the application for distribution, follow the above instructions to clone the repository and install dependencies.

Then run `npm run build` to generate the Angular distributable (available in `/dist`), and `npm run make` to compile that distributable into a Linux binary.

The resulting binary will be compressed in a ZIP file, and can be found in `/out/make`.
