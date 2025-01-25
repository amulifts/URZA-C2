# URZA

URZA is modern, asynchronous, multiplayer & multiserver C2/post-exploitation framework powered by Python 3 and .NETs DLR. It's the culmination of an extensive amount of research into using embedded third-party .NET scripting languages to dynamically call .NET API's, a technique the author coined as BYOI (Bring Your Own Interpreter). The aim of this tool and the BYOI concept is to shift the paradigm back to PowerShell style like attacks (as it offers much more flexibility over traditional C# tradecraft) only without using PowerShell in anyway.

Some of the main features that distinguish URZA are:
- **Multi-User & Multi-Server** - Supports multi-user collaboration. Additionally, the client can connect to and control multiple Teamservers.
- **Client and Teamserver Built in Python 3.7** - Latest and greatest features of the Python language are used, heavy use of Asyncio provides ludicrous speeds.
- **Real-time Updates and Communication** - Use of Websockets allow for real-time communication and updates between the Client and Teamserver.
- **Focus on Usability with an Extremely Modern CLI** - Powered by [prompt-toolkit](https://github.com/prompt-toolkit/python-prompt-toolkit).
- **Dynamic Evaluation/Compilation Using .NET Scripting Languages** - The URZA implant [Naga](https://github.com/byt3bl33d3r/Naga), is somewhat unique as it uses embedded third-party .NET scripting languages (e.g. [Boolang](https://github.com/boo-lang/boo)) to dynamically compile/evaluate tasks, this removes the need to compile tasks server side, allows for real-time editing of modules, provides greater flexibilty and stealth over traditional C# based payloads and makes everything much more light-weight.
- **ECDHE Encrypted C2 Communication** - URZA uses Ephemeral Elliptic Curve Diffie-Hellman Key Exchange to encrypt all C2 traffic between the Teamserver and its implant.
- **Fully Modular** - Listeners, Modules, Stagers and C2 Channels are fully modular allowing operators to easily build their own.
- **Extensive logging** - Every action is logged to a file.
- **Future proof** - HTTPS/HTTP listeners are built on [Quart](https://gitlab.com/pgjones/quart) & [Hypercorn](https://gitlab.com/pgjones/hypercorn) which also support HTTP2 & Websockets.

## Call for Contributions

I'm just one person developing this mostly in my spare time, I do need to have a life outside of computers (radical idea, I know).

This means that if anyone finds this tool useful and would like to see X functionality added, the best way to get it added is to submit a Pull Request.

Be the change you want to see in the world!

As of the time of writing the most useful thing you can contribute are post-ex modules: this would allow me to concentrate efforts on the framework itself, user experience, QOL features etc...

To do this, you're going to have to learn the Boo programming language (the Boo [wiki](https://github.com/boo-lang/boo/wiki) is amazing and has everything you'd need to get started), if you know Python you'll find yourself at home :).

Check out some of the existing [modules](../master/core/teamserver/modules/boo), if you've written an [Empire](https://github.com/EmpireProject/Empire) module before you'll see its very similar.
Finally you can start porting over post-ex modules from other C2 frameworks such as [Empire](https://github.com/EmpireProject/Empire).

## Documentation, Setup & Basic Usage

The documentation is a work in progress but some is already available in the [Wiki](https://github.com/byt3bl33d3r/URZA/wiki).

See [here](https://github.com/byt3bl33d3r/URZA/wiki/Installation) for install instructions and [here](https://github.com/byt3bl33d3r/URZA/wiki/Basic-Usage) for basic usage.

I recommend making wild use the ```help``` command and the ```-h``` flag :)