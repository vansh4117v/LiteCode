import { useRef, useState } from "react";
import "./EditorContainer.css";
import Editor from "@monaco-editor/react";

const editorOptions = {
    fontSize: 16,
    wordWrap: 'on',
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
    "java": `// Note: Please ensure your code is within the Main class to avoid errors.
class Main {
    public static void main(String[] args) {
        System.out.println("Hello World!");
    }
}
`
};

export const EditorContainer = ({ runCode, isHamburgerOpen }) => {
    const [code, setCode] = useState(defaultCodes['cpp']);
    const [key, setKey] = useState(0);
    const [language, setLanguage] = useState('cpp');
    const [theme, setTheme] = useState("vs-light");
    const [isFullScreen, setIsFullScreen] = useState(false);
    const codeRef = useRef(code);

    const onChangeCode = (newCode) => {
        codeRef.current = newCode;
    };

    const onUploadCode = (event) => {
        const file = event.target.files[0];
        console.log(file);
        if (file) {
            const fileType = file.type.includes("text");
            if (fileType) {
                const fileReader = new FileReader();
                fileReader.readAsText(file);
                fileReader.onload = function (value) {
                    const importedCode = value.target.result;
                    setCode(importedCode);
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
        const newCode = defaultCodes[newLanguage];
        setLanguage(newLanguage);
        setCode(newCode);
        codeRef.current = newCode;
    };

    const onChangeButtonTheme = () => {
        if (theme === 'vs-light') {
            setTheme('vs-dark');
        }
        else {
            setTheme('vs-light');
        }
    }

    const fullScreen = () => {
        setCode(codeRef.current)
        setIsFullScreen(!isFullScreen);
    };

    const onRunCode = () => {
        if (isFullScreen) {
            setIsFullScreen(!isFullScreen);
        }
        runCode({ code: codeRef.current, language });
    };

    const clearCode = () => {
        codeRef.current = "";
        setCode(codeRef.current);
    };
    const resetCode = () => {
        const defaultCode = defaultCodes[language];
        codeRef.current = defaultCode;
        setCode(defaultCode);
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
                        <a href="https://chatgpt.com/" target="_blank" style={{ textDecoration: "none" }}><img src="https://imgs.search.brave.com/XQ3uKnyIUak9nefj4ENiq2cL0LOWN0DQYdolfb4c4co/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy90/aHVtYi9lL2VmL0No/YXRHUFQtTG9nby5z/dmcvNjQwcHgtQ2hh/dEdQVC1Mb2dvLnN2/Zy5wbmc" height="30px" /></a>
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

                    {/* Change Mode Button */}
                    <button className="header-btn btn-theme remove" onClick={onChangeButtonTheme} title={theme === "vs-dark" ? "Light Mode" : "Dark Mode"}>
                        <span className="material-icons">{theme === "vs-dark" ? "light_mode" : "nights_stay"}</span>
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
                    theme={theme}
                    onChange={onChangeCode}
                    value={code}

                />
            </div>


            <div className="editor-footer">

                {/* Fullscreen Button */}
                <button className="btn" onClick={fullScreen}>
                    <span className="material-icons">{isFullScreen ? "close_fullscreen" : "fullscreen"}</span>
                    <span>{isFullScreen ? "Minimize" : "Full Screen"}</span>
                </button>

                {/* Import Code button */}
                <label htmlFor="import-code" className="btn remove">
                    <span className="material-icons">download</span>
                    <span>Import Code</span>
                </label>
                <input type="file" accept={`.txt,.${fileExtensionMapping[language]}`} id="import-code" style={{ display: 'none' }} onChange={(e) => { onUploadCode(e); e.target.value = ""; }} />

                {/* Export Code Button */}
                <button className="btn remove" onClick={exportCode}>
                    <span className="material-icons">upload</span>
                    <span>Export Code</span>
                </button>

                {/* Run Code Button */}
                <button className="btn" onClick={onRunCode}>
                    <span className="material-icons">play_arrow</span>
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
                    {isHamburgerOpen && <ul className="menu-list1">
                        <li onClick={clearCode}><span className="material-icons">chevron_right</span>Clear Code</li>
                        <li onClick={resetCode}><span className="material-icons">chevron_right</span>Reset Code</li>
                        <li onClick={onChangeButtonTheme}><span className="material-icons">chevron_right</span>{theme === "vs-dark" ? "Light Mode" : "Dark Mode"}</li>
                        <li><span className="material-icons">chevron_right</span><label htmlFor="import-code">Import Code</label></li>
                        <li onClick={exportCode}><span className="material-icons">chevron_right</span>Export Code</li>

                    </ul>}
                </div>
            )}

        </>
    );
};

// vansh4117v
