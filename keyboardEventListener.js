const { GlobalKeyboardListener } = require("node-global-key-listener"); 

process.on('disconnect', () => process.exit());

const listener = new GlobalKeyboardListener();

listener.addListener( event => { 
    const payload = {
        name: event.name,
        state: event.state,
        rawcode: event.rawcode
    };

    process.send?.(payload);
}); 