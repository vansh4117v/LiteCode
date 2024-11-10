const languageCodeMap = {
    cpp: 76,
    python: 100,
    javascript: 93,
    java: 62
}

async function getSubmission(tokenId, callback) {
    const url = `https://judge0-ce.p.rapidapi.com/submissions/${tokenId}?base64_encoded=true&fields=*`;
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': 'dfdb641863mshcb28efc2b45ed17p14f947jsnbdb6a65ef48c',
            // 'x-rapidapi-key': '1ee6bf71f8mshe79621553dd6fffp167ad0jsn112040369e0a',
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        const result = await response.json();
        return result;
    } catch (error) {
        callback({ apiStatus: 'error', message: JSON.stringify(error) })
    }
}

export async function makeSubmission({ code, language, callback, stdin }) {
    const url = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false&fields=*';
    const httpOptions = {
        method: 'POST',
        headers: {
            'x-rapidapi-key': 'dfdb641863mshcb28efc2b45ed17p14f947jsnbdb6a65ef48c',
            // 'x-rapidapi-key': '1ee6bf71f8mshe79621553dd6fffp167ad0jsn112040369e0a',
            'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            language_id: languageCodeMap[language],
            source_code: btoa(code),
            stdin: btoa(stdin)
        })
    };
    try {
        callback({ apiStatus: 'loading' })
        const response = await fetch(url, httpOptions);
        const result = await response.json();
        const tokenId = result.token;
        let apiSubmissionResult;
        let statusCode = 1;
        while (statusCode === 1 || statusCode === 2) {
            try {
                await new Promise(res => setTimeout(res, 1000));
                apiSubmissionResult = await getSubmission(tokenId);
                statusCode = apiSubmissionResult.status.id;
            } catch (error) {
                callback({ apiStatus: 'error', message: JSON.stringify(error) })
                return;
            }
        }
        if (apiSubmissionResult) {
            console.log(apiSubmissionResult);
            callback({ apiStatus: 'success', data: apiSubmissionResult })
        }
    } catch (error) {
        callback({
            apiStatus: 'error',
            message: JSON.stringify(error)
        })
    }
}
// vansh4117v