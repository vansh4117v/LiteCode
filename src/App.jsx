import { useCallback, useState } from "react";
import "./App.css"
import { EditorContainer } from "./EditorContainer";
import { makeSubmission } from "./PistonApi";

function App() {
	const [input, setInput] = useState('');
	const [output, setOutput] = useState('');
	const [showLoader, setShowLoader] = useState(false);
	const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);

	const importInput = (e) => {
		const file = e.target.files[0];
		if (file) {
			const fileType = file.type.includes("text")
			if (fileType) {
				const fileReader = new FileReader();
				fileReader.readAsText(file);
				fileReader.onload = (e) => {
					setInput(e.target.result);
				}
			}
		}
	}

	const exportOutput = () => {
		const outputValue = output.trim();
		if (!outputValue) {
			alert("Output is Empty");
			return;
		}
		const blob = new Blob([outputValue], { type: 'text/plain' })
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `output.txt`;
		link.click();
	}

	const callback = ({ apiStatus, data, message }) => {
		if (apiStatus === 'loading') {
			setShowLoader(true);
		}
		else if (apiStatus === 'error') {
			setShowLoader(false);
			setOutput("Something went wrong")
		}
		else {
			setShowLoader(false);
			setOutput(data);
		}
	}

	const toggleHamburger = () => {
		setIsHamburgerOpen(!isHamburgerOpen)
	}

	const runCode = useCallback(({ code, language }) => {
		setOutput("");
		makeSubmission({ code, language, stdin: input, callback })
		const outputBox = document.querySelector(".output-container");
		if (outputBox) {
			outputBox.scrollIntoView({ behavior: "smooth" });
		}
	}, [input])

	return (
		<div className="playground-container">
			<div className="header-container">
				<div className="site-heading">
					<img src="/LiteCode/logo.png" alt="logo" />
					<span className="title">LiteCode</span>
				</div>

				{/* Hamburger Menu Toggle Button */}
				<div className="hamburger" onClick={toggleHamburger}>
					{isHamburgerOpen ? (
						<span className="material-symbols-outlined">close</span>
					) : (
						<>
							<span className="hamburger-lines"></span>
							<span className="hamburger-lines"></span>
							<span className="hamburger-lines"></span>
						</>
					)}
				</div>
			</div>
			<div className="content-container">

				{/* Editor Container */}
				<div className="editor-container">
					<EditorContainer runCode={runCode} isHamburgerOpen={isHamburgerOpen} />
				</div>

				{/* Input Output Container */}
				<div className="input-output-outer-box">

					{/* Input Box */}
					<div className="input-output-container input-container">
						<div className="input-header">
							Input:
							<label htmlFor="input" className="icon-container remove">
								<span className="material-symbols-outlined">download</span>
								<span className="export-import-text">Import Input</span>
							</label>
							<input type="file" accept=".txt" id="input" style={{ display: 'none' }} onChange={(e) => { importInput(e); e.target.value = ""; }} />
						</div>
						<textarea value={input} onChange={(e) => setInput(e.target.value)}></textarea>
					</div>

					{/* Output Container */}
					<div className="input-output-container output-container">
						<div className="input-header">
							Output:
							<button className="icon-container remove" onClick={exportOutput}>
								<span className="material-symbols-outlined">upload</span>
								<span className="export-import-text">Export Output</span>
							</button>
						</div>
						<textarea readOnly value={output}></textarea>
					</div>
				</div>
			</div>

			{/* Loading Screen */}
			{showLoader && <div className="fullpage-loader">
				<div className="loader2">
				</div>
			</div>}


			{isHamburgerOpen && <div className="menu-background" onClick={toggleHamburger}>
				<div className="menu" onClick={(e) => e.stopPropagation()}>
				<div className="menu-title">Options</div>
				<hr />
				<ul className="menu-list2">
					<li><span className="material-symbols-outlined">chevron_right</span><label htmlFor="input">Import Input</label></li>
					<li onClick={exportOutput}><span className="material-symbols-outlined">chevron_right</span>Export Output</li>
				</ul>
				</div>
			</div>}
		</div>
	)
}
export default App;
// vansh4117v
