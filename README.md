# Frida Hook Script

This file contains the Frida JavaScript code that hooks `strlen` in `libc.so` to replace a target URL in memory, similar to the C++ technique described earlier.

Save the content below as `crack.js` and run with:
```bash
frida -U -l crack.js com.target.app
