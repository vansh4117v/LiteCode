// Language mapping for Piston API
const languageCodeMap = {
    cpp: "cpp",
    python: "python3",
    javascript: "javascript",
    java: "java"
};

// Function to make a code submission with the Piston API
export async function makeSubmission({ code, language, callback, stdin }) {
    const url = 'https://emkc.org/api/v2/piston/execute';
    const httpOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            language: languageCodeMap[language],
            version: "*",  // This uses the latest version available for the language
            files: [{ name: "code", content: code }],
            stdin: stdin ? stdin : ""
        })
    };

    try {
        callback({ apiStatus: 'loading' });
        const response = await fetch(url, httpOptions);

        if (!response.ok) {
            const errorText = await response.text();
            callback({
                apiStatus: 'error',
                message: `Error: ${response.status}. ${errorText}`
            });
            return;
        }

        const result = await response.json();
        if (result && result.run && result.run.output) {
            callback({
                apiStatus: 'success',
                data: result.run.output // The code output from Piston API
            });
        }
        else if (result && result.run && result.run.signal) {
            let errorMessage = result.run.signal;
            switch (result.run.signal) {
                case 'SIGKILL':
                    errorMessage += "\nPossible cause: Infinite loop, memory overload, or long-running execution.";
                    break;
                case 'SIGSEGV':
                    errorMessage += "\nPossible cause: Segmentation fault, invalid memory access.";
                    break;
                case 'SIGTERM':
                    errorMessage += "\nPossible cause: Process was terminated by the system.";
                    break;
                case 'SIGABRT':
                    errorMessage += "\nPossible cause: Abnormal termination (e.g., assert failure).";
                    break;
                default:
                    errorMessage += "\nCheck for potential issues in the code.";
                    break;
            }
            callback({
                apiStatus: 'success',
                data: errorMessage
            });
        }
        else {
            callback({
                apiStatus: 'error',
                message: "No output received or there was an issue with execution."
            });
        }
    } catch (error) {
        callback({
            apiStatus: 'error',
            message: JSON.stringify(error)
        });
    }
}
