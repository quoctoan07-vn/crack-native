const TARGET_URL = "https://user.com/connect";
const NEW_URL    = "https://hacker.com/conn"; //cố gắng để link thay thế dài bằng link gốc tránh tràn dữ liệu nhé :v

function replaceUrlInMemory(strPtr, oldUrl, newUrl) {
    try {
        const original = Memory.readUtf8String(strPtr);
        if (!original || !original.includes(oldUrl)) return false;

        console.log(`[*] Phát hiện strlen trên chuỗi: ${original.substring(0, 100)}`);
        
        const newBytes = new TextEncoder().encode(newUrl);
        const newLen = newBytes.length;
        
        const pageSize = Process.pageSize;
        const pageStart = strPtr.sub(pageSize - 1).and(~(pageSize - 1));
        Memory.protect(pageStart, pageSize, 'rwx');
        
        for (let i = 0; i < newLen; i++) {
            strPtr.add(i).writeU8(newBytes[i]);
        }
        strPtr.add(newLen).writeU8(0);
        
        const oldLen = original.length;
        for (let i = newLen + 1; i < oldLen; i++) {
            strPtr.add(i).writeU8(0);
        }
        
        console.log(`[✓] Đã thay thế thành công: ${original} -> ${newUrl}`);
        return true;
    } catch (e) {
        console.warn(`[!] Không thể ghi đè chuỗi: ${e}`);
        return false;
    }
}

const strlenPtr = Module.findExportByName("libc.so", "strlen");
if (strlenPtr) {
    console.log(`[+] Tìm thấy strlen tại ${strlenPtr}`);
    
    Interceptor.attach(strlenPtr, {
        onEnter(args) {
            this.strPtr = args[0];
        },
        onLeave(retVal) {
            replaceUrlInMemory(this.strPtr, TARGET_URL, NEW_URL);
        }
    });
    console.log("[✓] Hook strlen thành công");
} else {
    console.error("[-] Không tìm thấy strlen trong libc.so");
}

const strstrPtr = Module.findExportByName("libc.so", "strstr");
if (strstrPtr) {
    Interceptor.attach(strstrPtr, {
        onEnter(args) {
            const haystack = args[0];
            const needle = args[1];
            const needleStr = Memory.readUtf8String(needle);
            if (needleStr && needleStr.includes(TARGET_URL)) {
                console.log("[*] strstr đang tìm URL cũ, có thể bypass");
            }
        }
    });
    console.log("[✓] Hook strstr thành công");
}
