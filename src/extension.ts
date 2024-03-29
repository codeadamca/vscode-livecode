// process.env.NODE_TLS_REJECT_UNAUTHORIZED='0'

import fetch from 'node-fetch';
import * as vscode from 'vscode';

let livecodeStatus = "Off";

const status = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

export function activate({ subscriptions }: vscode.ExtensionContext) {

	status.text = "$(sync-ignored) LiveCode";
	status.color = "#fff";
	status.show();

	let livecodeOn = vscode.commands.registerCommand('livecode.activate', async () => {

		status.text = "$(sync) LiveCode";
		livecodeStatus = "On";
		vscode.window.showInformationMessage("LiveCode: LiveCode has been activated! ");

	});

	subscriptions.push(livecodeOn);

	let livecodeOff = vscode.commands.registerCommand('livecode.deactivate', async () => {

		status.text = "$(sync-ignored) LiveCode";
		livecodeStatus = "Off";
		vscode.window.showInformationMessage("LiveCode: LiveCode has been deactivated! ");

	});

	subscriptions.push(livecodeOff);

	let livecodeReset = vscode.commands.registerCommand('livecode.reset', async () => {

		resetLivecode();

	});

	subscriptions.push(livecodeReset);

	subscriptions.push(vscode.workspace.onDidSaveTextDocument(updateLivecode));

}

async function resetLivecode() {

	status.text = "$(sync~spin) LiveCode";
	
	const github = vscode.workspace.getConfiguration('livecode').githubUsername;
	const api = "https://console.codeadam.ca/api/livecode/reset";

	const headers = {"Content-Type": "application/json"};
	const body = JSON.stringify({
		"github": github
	});

	await fetch(api, {method: 'POST', headers: headers, body: body});

	vscode.window.showInformationMessage("LiveCode: Paths have been reset!");

	if (livecodeStatus === "On")
	{
		status.text = "$(sync) LiveCode";
	} 
	else 
	{
		status.text = "$(sync-ignored) LiveCode";
	}

}

async function updateLivecode() {
	
	if (livecodeStatus === "On")
	{	

		status.text = "$(sync~spin) LiveCode";

		const editor = vscode.window.activeTextEditor;

		if (!editor)
		{
			vscode.window.showInformationMessage("LiveCode: Error: Editor does not exist");
			return;
		}

		const path = editor.document.uri.path;
		const content = editor.document.getText();
		const github = vscode.workspace.getConfiguration('livecode').githubUsername;
		const display = vscode.workspace.getConfiguration('livecode').displayName;
		const api = "https://console.codeadam.ca/api/livecode/save";

		const headers = {"Content-Type": "application/json"};
		const body = JSON.stringify({
			"path": path,
			"content": content,
			"display": display,
			"github": github
		});  

		let response = await fetch(api, {method: 'POST', headers: headers, body: body});
		const data = await response.json();

		console.log(data);

		vscode.window.showInformationMessage("LiveCode: Code has been updated!");

		status.text = "$(sync) LiveCode";

	}

}

export function deactivate() {}
