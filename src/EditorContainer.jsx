import { useRef, useState } from "react";
import "./EditorContainer.css";
import Editor from "@monaco-editor/react";

const defaultEditorOptions = {
    fontSize: 16,
    wordWrap: 'on',
    theme: 'vs-light',
    lineNumbersMinChars: 2,
};

const fileExtensionMapping = {
    cpp: 'cpp',
    javascript: 'js',
    python: 'py',
    java: 'java'
};

const defaultCodes = {
    'cpp': `#include<iostream>
using namespace std;
int main(){
    cout<<"Hello World!"<<endl;
    return 0;
}
`,
    'javascript': `console.log("Hello World!")`,
    'python': `print("Hello World!")`,
    "java": `class Main {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}
`
};

export const EditorContainer = ({ runCode, isHamburgerOpen }) => {
    const [code, setCode] = useState({ ...defaultCodes });
    const [key, setKey] = useState(0);
    const [language, setLanguage] = useState('cpp');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [editorOptions, setEditorOptions] = useState(defaultEditorOptions);
    const codeRef = useRef(code[language]);

    const onChangeCode = (newCode) => {
        codeRef.current = newCode;
    };

    const onUploadCode = (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileType = file.type.includes("text");
            if (fileType) {
                const fileReader = new FileReader();
                fileReader.readAsText(file);
                fileReader.onload = function (value) {
                    const importedCode = value.target.result;
                    setCode(prevCode => ({
                        ...prevCode,
                        [language]: importedCode
                    }));
                    setKey(key + 1);
                    codeRef.current = importedCode;
                };
            } else {
                alert("Please choose a text file");
            }
        }
    };

    const exportCode = () => {
        const codeValue = codeRef.current?.trim();
        if (!codeValue) {
            alert("Please enter some code");
        } else {
            const codeBlob = new Blob([codeValue], { type: "text/plain" });
            const downloadUrl = URL.createObjectURL(codeBlob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `code.${fileExtensionMapping[language]}`;
            link.click();
        }
    };

    const onChangeLanguage = (event) => {
        const newLanguage = event.target.value;
        const newCode = code[newLanguage];
        const currentCode = codeRef.current;
        setCode(prevCode => ({
            ...prevCode,
            [language]: currentCode
        }));
        setLanguage(newLanguage);
        codeRef.current = newCode;
    };

    const onChangeThemeSettings = () => {
        setEditorOptions(prevOptions => ({
            ...prevOptions,
            theme: prevOptions.theme === "vs-light" ? "vs-dark" : "vs-light"
        }));
    }

    const onToggleSettings = () => {
        setIsSettingsOpen(!isSettingsOpen);
    }

    const onIncreaseFontSize = () => {
        setEditorOptions(prevOptions => ({
            ...prevOptions,
            fontSize: prevOptions.fontSize + 1
        }));
    }

    const onDecreaseFontSize = () => {
        setEditorOptions(prevOptions => ({
            ...prevOptions,
            fontSize: prevOptions.fontSize - 1
        }));
    }

    const setFontSize = (event) => {
        setEditorOptions(prevOptions => ({
            ...prevOptions,
            fontSize: event.target.value
        }));
    }

    const toggleWordWrap = () => {
        setEditorOptions(prevOptions => ({
            ...prevOptions,
            wordWrap: prevOptions.wordWrap === "on" ? "off" : "on"
        }));
    }

    const fullScreen = () => {
        setCode(prevCode => ({
            ...prevCode,
            [language]: codeRef.current
        }));
        setIsFullScreen(!isFullScreen);
    };

    const onRunCode = () => {
        if (isFullScreen) {
            fullScreen();
        }
        runCode({ code: codeRef.current, language });
    };

    const clearCode = () => {
        codeRef.current = "";
        setCode(prevCode => ({
            ...prevCode,
            [language]: ""
        }));
    };
    const resetCode = () => {
        const defaultCode = defaultCodes[language];
        codeRef.current = defaultCode;
        setCode(prevCode => ({
            ...prevCode,
            [language]: defaultCode
        }));
        setKey(key + 1);
    };

    // Reusable function for the editor layout
    const renderEditorLayout = () => (
        <>
            <div className="editor-header">

                <div className="editor-left-container">
                    <h3 className="title">Code</h3>
                </div>

                <div className="editor-right-container">

                    {/* ChatGpt Button */}
                    <div className="gpt" title="Debug your code with AI" style={{ marginRight: '10px' }}>
                        <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}><img src="/LiteCode/ChatgptLogo.webp" alt="Chatgpt" height="30px" /></a>
                    </div>

                    {/* Clear Code Button */}
                    <button className="header-btn remove" onClick={clearCode} title="Erase entire code">
                        Clear
                    </button>

                    {/* Reset Button */}
                    <button className="header-btn remove" onClick={resetCode} title="Reset code to default">
                        Reset
                    </button>

                    {/* Change Language DropDown */}
                    <select value={language} onChange={onChangeLanguage} title="Change Language">
                        <option value="cpp">C++</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="javascript">Javascript</option>
                    </select>

                    {/* Open Settings Button */}
                    <button className="header-btn btn-theme remove" onClick={onToggleSettings} title="Configure Editor">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>
            </div>


            {/* Monaco Editor Component */}
            <div className="editor-body">
                <Editor
                    key={key}
                    height={"100%"}
                    language={language}
                    options={editorOptions}
                    theme={editorOptions.theme}
                    onChange={onChangeCode}
                    value={code[language]}
                />
            </div>


            <div className="editor-footer">

                {/* Fullscreen Button */}
                <button className="btn" onClick={fullScreen}>
                    <span className="material-symbols-outlined">{isFullScreen ? "close_fullscreen" : "fullscreen"}</span>
                    <span>{isFullScreen ? "Minimize" : "Full Screen"}</span>
                </button>

                {/* Import Code button */}
                <label htmlFor="import-code" className="btn remove">
                    <span className="material-symbols-outlined">download</span>
                    <span>Import Code</span>
                </label>
                <input type="file" accept={`.txt,.${fileExtensionMapping[language]}`} id="import-code" style={{ display: 'none' }} onChange={(e) => { onUploadCode(e); e.target.value = ""; }} />

                {/* Export Code Button */}
                <button className="btn remove" onClick={exportCode}>
                    <span className="material-symbols-outlined">upload</span>
                    <span>Export Code</span>
                </button>

                {/* Run Code Button */}
                <button className="btn" onClick={onRunCode}>
                    <span className="material-symbols-outlined">play_circle</span>
                    <span>Run Code</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {isFullScreen ? (
                <div className="fullscreen" onload="window.scrollTo(0, 1);">
                    {/* <div className="fullscreen"> */}
                    <div className="root-editor-container">
                        {renderEditorLayout()}
                    </div>
                </div>
            ) : (
                <div className="root-editor-container">
                    {renderEditorLayout()}

                    {/* HamburgerMenu */}
                    {isHamburgerOpen && <ul className="menu-list1" onClick={(e) => e.stopPropagation()}>
                        <li onClick={clearCode}><span className="material-symbols-outlined">chevron_right</span>Clear Code</li>
                        <li onClick={resetCode}><span className="material-symbols-outlined">chevron_right</span>Reset Code</li>
                        <li onClick={() => { setIsSettingsOpen(true); }}><span className="material-symbols-outlined">chevron_right</span>Editor Settings</li>
                        <li><span className="material-symbols-outlined">chevron_right</span><label htmlFor="import-code">Import Code</label></li>
                        <li onClick={exportCode}><span className="material-symbols-outlined">chevron_right</span>Export Code</li>
                    </ul>}
                    {isSettingsOpen && <div className="settings-background" onClick={onToggleSettings}>
                        <div className="settings-container" onClick={(event) => event.stopPropagation()}>
                            <div className="settings-header">
                                <span className="settings-header-title">Editor Settings</span>
                                <span className="material-symbols-outlined settings-close" onClick={onToggleSettings}>close</span>
                            </div>
                            <div className="settings-body">
                                <div className="settings-card">
                                    <div className="settings-card-left">
                                        <p className="settings-card-title">Theme</p>
                                        <p className="settings-card-desc remove">Tired of the white background? Try different styles and syntax highlighting.</p>
                                    </div>
                                    <div className="settings-card-right settings-theme-button" onClick={onChangeThemeSettings}>
                                        {editorOptions.theme === "vs-dark" ? "Light Mode" : "Dark Mode"}
                                    </div>
                                </div>
                                <div className="settings-card">
                                    <div className="settings-card-left">
                                        <p className="settings-card-title">Font Size</p>
                                        <p className="settings-card-desc remove">Choose your preferred font size for the code editor.</p>
                                    </div>
                                    <div className="settings-card-right">
                                        <span className="font-button font-minus" onClick={onDecreaseFontSize}>-</span>
                                        <span className="font-value"><input type="text" value={editorOptions.fontSize} onChange={setFontSize} /></span>
                                        <span className="font-button font-plus" onClick={onIncreaseFontSize}>+</span>
                                    </div>
                                </div>
                                <div className="settings-card">
                                    <div className="settings-card-left">
                                        <p className="settings-card-title">Word Wrap</p>
                                        <p className="settings-card-desc remove">Wrap long lines of code to stay within the editor's view.</p>
                                    </div>
                                    <div className="settings-card-right">
                                        <input className="wrap-checkbox" type="checkbox" checked={editorOptions.wordWrap === "on"} onClick={toggleWordWrap} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>}
                </div>
            )}

        </>
    );
};

// vansh4117v
