import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

document.addEventListener('DOMContentLoaded', async () => {
    if (!Capacitor.isNativePlatform()) {
        alert("NOT NATIVE");
        return;
    }

    try {
        await Filesystem.writeFile({
            path: 'seluna/test.txt',
            data: 'IT FUCKING WORKS',
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });

        alert("FILE SAVED");
    } catch (e) {
        alert("ERROR: " + JSON.stringify(e));
        console.error(e);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('test_btn1');
    if (btn) {
        btn.addEventListener('touchstart', () => {
            alert("BUTTON PRESSED 1");
        });
    } else {
        console.error("btn1 not found");
    }
});