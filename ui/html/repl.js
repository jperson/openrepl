Terminal.applyAddon(fit);
Terminal.applyAddon(attach);
var term1 = new Terminal({
    cursorBlink: true
});
var term2;
term1.open(document.getElementById("terminal"));
var t1ws;
var t1c = true;
function updateT1WS(ws) {
    t1ws = ws;
    t1c = false;
    ws.onclose = function() {
        term1.detach(ws);
        t1c = true;
    };
    term1.attach(ws, true, true);
}
function loadTerm1(lang) {
    if(!t1c) {
        t1ws.onclose = function() {};
        term1.detach(t1ws);
        t1ws.close();
    }
    term1.reset();
    openrepl.term(lang).then((ws) => updateT1WS(ws), (e) => console.log(e));
}
var runbtn = document.getElementById("runbtn");
var savebtn = document.getElementById("savebtn");
ace.require("ace/ext/language_tools");
var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.setFontSize(20);
editor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    copyWithEmptySelection: true,
    fadeFoldWidgets: true
});
editor.commands.addCommand({
    name: 'save',
    bindKey: {
        win: 'Ctrl-S',
        mac: 'Command-S',
        sender: 'editor'
    },
    exec: function(env, args, request) {
        savebtn.click();
    }
});
editor.commands.addCommand({
    name: 'run',
    bindKey: {
        win: 'Ctrl-R',
        mac: 'Command-R',
        sender: 'editor'
    },
    exec: function(env, args, request) {
        runbtn.click();
    }
});
var termdiv = document.getElementById("termdiv");
var t2 = document.getElementById("term2");
window.onresize=function() {
    document.getElementById("editor").style.top = document.getElementById("buttons").offsetTop + document.getElementById("buttons").offsetHeight;
    document.getElementById("terminal").style.top = document.getElementById("container").offsetTop;
    document.getElementById("terminal").style.left = document.getElementById("editor").offsetWidth;
    document.getElementById("terminal").style.height = window.innerHeight - document.getElementById("container").offsetTop;
    document.getElementById("buttons").style.width = document.getElementById("editor").offsetWidth;
    if(termdiv.style.visibility == "visible") {
        var eh = 0.65 * window.innerHeight;
        var et = document.getElementById("editor").offsetTop;
        document.getElementById("editor").style.height = eh;
        t2.style.top = et + eh;
        t2.style.height = window.innerHeight - (et + eh);
        term2.fit();
    }
    term1.fit();
};
window.onresize();
var language = "lua";
function setLanguage(lang) {
    if(lang == "bash") {
        editor.getSession().setMode("ace/mode/sh");
    } else if(lang == "cpp") {
        editor.getSession().setMode("ace/mode/c_cpp");
    } else {
        editor.getSession().setMode("ace/mode/"+lang);
    }
    editor.setValue(demos[lang], -1);
    loadTerm1(lang);
    language = lang;
}
setLanguage("lua");
var t2ws;
var t2c = true;
runbtn.onclick = function() {
    runbtn.classList.add("disabled");
    if(term2) {
        term2.reset();
    }
    openrepl.run(editor.getValue(), language).then(function(ws) {
        if(!t2c) {
            t2ws.onclose = function() {};
            t2ws.close();
            term2.detach(t2ws);
            term2.reset();
        }
        termdiv.style.visibility = "visible";
        t2ws = ws;
        if(!term2) {
            term2 = new Terminal({
                cursorBlink: true
            });
            term2.open(document.getElementById("term2"));
            window.onresize();
        }
        term2.attach(ws);
        runbtn.classList.remove("disabled");
    }, function(e) {
        console.log(e);
        runbtn.classList.remove("disabled");
    });
};
savebtn.onclick = function() {
    savebtn.classList.add("disabled");
    openrepl.store(editor.getValue(), language).then(function(key) {
        var u = new URL(window.location.href);
        u.searchParams.set('key', key);
        window.location.replace(u.toString());
    }, function(e) {
        alert('Failed to save.');
        console.log(e);
        savebtn.classList.remove("disabled");
    })
};
function attachLang(l) {
    document.getElementById("lang-"+l).onclick = function() {
        setLanguage(l);
    };
}
attachLang("lua");
attachLang("python2");
attachLang("python3");
attachLang("forth");
attachLang("cpp");
attachLang("bash");
attachLang("javascript");
attachLang("typescript");
attachLang("php");

(function() {
    var url = new URL(window.location.href);
    var key = url.searchParams.get('key');
    if(key == null) {
        return;
    }
    openrepl.load(key).then(function(code) {
        setLanguage(code.language);
        editor.setValue(code.code, -1);
    }, function(e) {
        alert('Failed to load.');
        console.log(e);
    });
})();