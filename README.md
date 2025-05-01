# Fortuna

[![Discord](https://dcbadge.vercel.app/api/server/xWRaCDBtW4?style=flat)](https://discord.gg/xWRaCDBtW4)

This is an Electron application that provides access to Deepgram's Voice Agent as a desktop application.

We currently build and distribute a binary for Linux which should be distro-agnostic.

## What is Deepgram?

[Deepgram’s](https://deepgram.com/) voice AI platform provides APIs for speech-to-text, text-to-speech, and full speech-to-speech voice agents. Over 200,000+ developers use Deepgram to build voice AI products and features.

## Sign-up to Deepgram

Before you start, it's essential to generate a Deepgram API key to use in this project. [Sign-up now for Deepgram and create an API key](https://console.deepgram.com/signup?jump=keys).

## Installation

Grab the latest `release.zip` release from the Releases tab. Extract the archive and copy the contents to `~/.fortuna`.

Then, create a `~/.local/share/applications/fortuna.desktop` file and copy the contents of our `fortuna.desktop` file in this repository.

You can then launch Fortuna through your favourite application launcher!

## Usage

The first time you use the application, you will need to configure your API key and agent settings.

Once you have configured these, you can click "Start Agent" to load the interface. Click "Connect" to connect to the agent and begin conversing.

## Development

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

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Security Policy](./SECURITY.md) details the procedure for contacting Deepgram.

## Getting Help

We love to hear from you so if you have questions, comments or find a bug in the project, let us know! You can either:

- [Open an issue in this repository](https://github.com/deepgram-starters/prerecorded-sinatra-starter/issues/new)
- [Join the Deepgram Github Discussions Community](https://github.com/orgs/deepgram/discussions)
- [Join the Deepgram Discord Community](https://discord.gg/xWRaCDBtW4)