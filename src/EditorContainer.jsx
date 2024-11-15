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

    const arrowRight = () => (
        <>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#ffffff">
                <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
            </svg>
        </>
    )

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
                    <span><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z"/></svg></span>
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
                    {isFullScreen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                            <path d="m136-80-56-56 264-264H160v-80h320v320h-80v-184L136-80Zm344-400v-320h80v184l264-264 56 56-264 264h184v80H480Z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                            <path d="M120-120v-200h80v120h120v80H120Zm520 0v-80h120v-120h80v200H640ZM120-640v-200h200v80H200v120h-80Zm640 0v-120H640v-80h200v200h-80Z" />
                        </svg>
                    )}
                    <span>{isFullScreen ? "Minimize" : "Full Screen"}</span>
                </button>

                {/* Import Code button */}
                <label htmlFor="import-code" className="btn remove">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                        <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
                    </svg>
                    <span>Import Code</span>
                </label>
                <input type="file" accept={`.txt,.${fileExtensionMapping[language]}`} id="import-code" style={{ display: 'none' }} onChange={(e) => { onUploadCode(e); e.target.value = ""; }} />

                {/* Export Code Button */}
                <button className="btn remove" onClick={exportCode}> 
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                        <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
                    </svg>
                    <span>Export Code</span>
                </button>

                {/* Run Code Button */}
                <button className="btn" onClick={onRunCode}>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                        <path d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                    </svg>
                    <span>Run Code</span>
                </button>
            </div>
        </>
    );

    return (
        <>
            {isFullScreen ? (
                <div className="fullscreen" onload="window.scrollTo(0, 1);">
                    <div className="root-editor-container">
                        {renderEditorLayout()}
                    </div>
                </div>
            ) : (
                <div className="root-editor-container">
                    {renderEditorLayout()}

                    {/* HamburgerMenu */}
                    {isHamburgerOpen && <ul className="menu-list1" onClick={(e) => e.stopPropagation()}>
                        <li onClick={clearCode}>{arrowRight()}Clear Code</li>
                        <li onClick={resetCode}>{arrowRight()}Reset Code</li>
                        <li onClick={() => { setIsSettingsOpen(true); }}>{arrowRight()}Editor Settings</li>
                        <li>{arrowRight()}<label htmlFor="import-code">Import Code</label></li>
                        <li onClick={exportCode}>{arrowRight()}Export Code</li>
                    </ul>}
                    {isSettingsOpen && <div className="settings-background" onClick={onToggleSettings}>
                        <div className="settings-container" onClick={(event) => event.stopPropagation()}>
                            <div className="settings-header">
                                <span className="settings-header-title">Editor Settings</span>
                                    <span className="settings-close" onClick={onToggleSettings}>
                                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                                            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                                        </svg>
                                    </span>
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
