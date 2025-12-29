import { FFIType } from "bun:ffi";
export declare const user32: import("bun:ffi").Library<{
    SendInput: {
        args: (FFIType.int32_t | FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.uint32_t;
    };
    MapVirtualKeyW: {
        args: FFIType.uint32_t[];
        returns: FFIType.uint32_t;
    };
    GetCursorPos: {
        args: FFIType.ptr[];
        returns: FFIType.bool;
    };
    GetKeyState: {
        args: FFIType.int32_t[];
        returns: FFIType.int16_t;
    };
    GetAsyncKeyState: {
        args: FFIType.int32_t[];
        returns: FFIType.int16_t;
    };
    SetWindowsHookExW: {
        args: (FFIType.int32_t | FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.ptr;
    };
    UnhookWindowsHookEx: {
        args: FFIType.ptr[];
        returns: FFIType.bool;
    };
    CallNextHookEx: {
        args: (FFIType.int32_t | FFIType.ptr)[];
        returns: FFIType.ptr;
    };
    GetDC: {
        args: FFIType.ptr[];
        returns: FFIType.uint64_t;
    };
    ReleaseDC: {
        args: FFIType.uint64_t[];
        returns: FFIType.int32_t;
    };
    GetDesktopWindow: {
        args: any[];
        returns: FFIType.ptr;
    };
    GetForegroundWindow: {
        args: any[];
        returns: FFIType.uint64_t;
    };
    GetWindowTextW: {
        args: (FFIType.int32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.int32_t;
    };
    GetWindowRect: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.bool;
    };
    GetSystemMetrics: {
        args: FFIType.int32_t[];
        returns: FFIType.int32_t;
    };
    SetLayeredWindowAttributes: {
        args: (FFIType.int8_t | FFIType.uint32_t | FFIType.uint64_t)[];
        returns: FFIType.bool;
    };
    UpdateLayeredWindow: {
        args: (FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.bool;
    };
    GetWindowLongW: {
        args: (FFIType.int32_t | FFIType.uint64_t)[];
        returns: FFIType.int32_t;
    };
    SetWindowLongW: {
        args: (FFIType.int32_t | FFIType.uint64_t)[];
        returns: FFIType.int32_t;
    };
    CreateWindowExW: {
        args: (FFIType.int32_t | FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.ptr;
    };
    ShowWindow: {
        args: (FFIType.int32_t | FFIType.uint64_t)[];
        returns: FFIType.bool;
    };
    UpdateWindow: {
        args: FFIType.uint64_t[];
        returns: FFIType.bool;
    };
    SetWindowPos: {
        args: (FFIType.int32_t | FFIType.uint32_t | FFIType.uint64_t)[];
        returns: FFIType.bool;
    };
    FindWindowA: {
        args: FFIType.ptr[];
        returns: FFIType.uint64_t;
    };
    FillRect: {
        args: FFIType.ptr[];
        returns: FFIType.int32_t;
    };
    IsWindow: {
        args: FFIType.uint64_t[];
        returns: FFIType.bool;
    };
    SetForegroundWindow: {
        args: FFIType.uint64_t[];
        returns: FFIType.bool;
    };
    IsWindowVisible: {
        args: FFIType.uint64_t[];
        returns: FFIType.bool;
    };
    GetWindowThreadProcessId: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.uint32_t;
    };
    MoveWindow: {
        args: (FFIType.int32_t | FFIType.uint64_t | FFIType.bool)[];
        returns: FFIType.bool;
    };
    GetClientRect: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.bool;
    };
    PostMessageA: {
        args: (FFIType.uint32_t | FFIType.uint64_t)[];
        returns: FFIType.bool;
    };
    GetClassNameA: {
        args: (FFIType.int32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.int32_t;
    };
    SetWindowTextW: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.bool;
    };
    EnableWindow: {
        args: (FFIType.uint64_t | FFIType.bool)[];
        returns: FFIType.bool;
    };
    RedrawWindow: {
        args: (FFIType.uint32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.bool;
    };
    ClientToScreen: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.bool;
    };
    ScreenToClient: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.bool;
    };
    SendMessageA: {
        args: (FFIType.uint32_t | FFIType.uint64_t)[];
        returns: FFIType.ptr;
    };
    IsIconic: {
        args: FFIType.uint64_t[];
        returns: FFIType.bool;
    };
    IsZoomed: {
        args: FFIType.uint64_t[];
        returns: FFIType.bool;
    };
    EnumWindows: {
        args: (FFIType.int64_t | FFIType.function)[];
        returns: FFIType.bool;
    };
    EnumChildWindows: {
        args: (FFIType.int64_t | FFIType.uint64_t | FFIType.function)[];
        returns: FFIType.bool;
    };
    FlashWindow: {
        args: (FFIType.uint64_t | FFIType.bool)[];
        returns: FFIType.bool;
    };
    PrintWindow: {
        args: (FFIType.uint32_t | FFIType.uint64_t)[];
        returns: FFIType.bool;
    };
    GetWindowDC: {
        args: FFIType.uint64_t[];
        returns: FFIType.uint64_t;
    };
    LoadImageW: {
        args: (FFIType.int32_t | FFIType.uint32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.uint64_t;
    };
    SetWindowRgn: {
        args: (FFIType.uint64_t | FFIType.bool)[];
        returns: FFIType.int32_t;
    };
    InvalidateRect: {
        args: (FFIType.bool | FFIType.ptr)[];
        returns: FFIType.bool;
    };
    RegisterClassExW: {
        args: FFIType.ptr[];
        returns: FFIType.uint16_t;
    };
    DefWindowProcW: {
        args: (FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.ptr;
    };
    EnumDisplayMonitors: {
        args: (FFIType.ptr | FFIType.function)[];
        returns: FFIType.bool;
    };
    GetMonitorInfoW: {
        args: FFIType.ptr[];
        returns: FFIType.bool;
    };
    PeekMessageW: {
        args: (FFIType.uint32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.bool;
    };
    TranslateMessage: {
        args: FFIType.ptr[];
        returns: FFIType.bool;
    };
    DispatchMessageW: {
        args: FFIType.ptr[];
        returns: FFIType.ptr;
    };
    BeginPaint: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.uint64_t;
    };
    EndPaint: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.bool;
    };
    DestroyWindow: {
        args: FFIType.uint64_t[];
        returns: FFIType.bool;
    };
    LoadCursorW: {
        args: FFIType.uint64_t[];
        returns: FFIType.uint64_t;
    };
}>;
export declare const gdi32: import("bun:ffi").Library<{
    GetPixel: {
        args: (FFIType.int32_t | FFIType.uint64_t)[];
        returns: FFIType.uint32_t;
    };
    CreatePen: {
        args: (FFIType.int32_t | FFIType.uint32_t)[];
        returns: FFIType.uint64_t;
    };
    SelectObject: {
        args: FFIType.uint64_t[];
        returns: FFIType.uint64_t;
    };
    MoveToEx: {
        args: (FFIType.int32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.bool;
    };
    LineTo: {
        args: (FFIType.int32_t | FFIType.uint64_t)[];
        returns: FFIType.bool;
    };
    DeleteObject: {
        args: FFIType.uint64_t[];
        returns: FFIType.bool;
    };
    CreateCompatibleDC: {
        args: FFIType.uint64_t[];
        returns: FFIType.uint64_t;
    };
    CreateDIBSection: {
        args: (FFIType.uint32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.uint64_t;
    };
    DeleteDC: {
        args: FFIType.uint64_t[];
        returns: FFIType.bool;
    };
    CreateSolidBrush: {
        args: FFIType.uint32_t[];
        returns: FFIType.uint64_t;
    };
    CreateCompatibleBitmap: {
        args: (FFIType.int32_t | FFIType.uint64_t)[];
        returns: FFIType.uint64_t;
    };
    BitBlt: {
        args: (FFIType.int32_t | FFIType.uint32_t | FFIType.uint64_t)[];
        returns: FFIType.bool;
    };
    GetDIBits: {
        args: (FFIType.uint32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.int32_t;
    };
    StretchDIBits: {
        args: (FFIType.int32_t | FFIType.uint32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.int32_t;
    };
    GetObjectA: {
        args: (FFIType.int32_t | FFIType.ptr)[];
        returns: FFIType.int32_t;
    };
    PatBlt: {
        args: (FFIType.int32_t | FFIType.uint32_t | FFIType.uint64_t)[];
        returns: FFIType.bool;
    };
    CreateRectRgn: {
        args: FFIType.int32_t[];
        returns: FFIType.uint64_t;
    };
    CreateEllipticRgn: {
        args: FFIType.int32_t[];
        returns: FFIType.uint64_t;
    };
    CreateRoundRectRgn: {
        args: FFIType.int32_t[];
        returns: FFIType.uint64_t;
    };
    CreatePolygonRgn: {
        args: (FFIType.int32_t | FFIType.ptr)[];
        returns: FFIType.uint64_t;
    };
    Rectangle: {
        args: (FFIType.int32_t | FFIType.uint64_t)[];
        returns: FFIType.bool;
    };
    Ellipse: {
        args: (FFIType.int32_t | FFIType.uint64_t)[];
        returns: FFIType.bool;
    };
    SetBkMode: {
        args: (FFIType.int32_t | FFIType.uint64_t)[];
        returns: FFIType.int32_t;
    };
    GetStockObject: {
        args: FFIType.int32_t[];
        returns: FFIType.uint64_t;
    };
}>;
export declare const kernel32: import("bun:ffi").Library<{
    GetModuleHandleW: {
        args: FFIType.ptr[];
        returns: FFIType.uint64_t;
    };
    GetLastError: {
        args: any[];
        returns: FFIType.uint32_t;
    };
    OpenProcess: {
        args: (FFIType.uint32_t | FFIType.bool)[];
        returns: FFIType.uint64_t;
    };
    CloseHandle: {
        args: FFIType.uint64_t[];
        returns: FFIType.bool;
    };
    QueryFullProcessImageNameW: {
        args: (FFIType.uint32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.bool;
    };
    TerminateProcess: {
        args: (FFIType.uint32_t | FFIType.uint64_t)[];
        returns: FFIType.bool;
    };
    RtlMoveMemory: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.void;
    };
}>;
export declare const gdiplus: import("bun:ffi").Library<{
    GdiplusStartup: {
        args: FFIType.ptr[];
        returns: FFIType.int32_t;
    };
    GdiplusShutdown: {
        args: FFIType.uint64_t[];
        returns: FFIType.void;
    };
    GdipCreateBitmapFromFile: {
        args: FFIType.ptr[];
        returns: FFIType.int32_t;
    };
    GdipGetImageWidth: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.int32_t;
    };
    GdipGetImageHeight: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.int32_t;
    };
    GdipBitmapLockBits: {
        args: (FFIType.int32_t | FFIType.uint32_t | FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.int32_t;
    };
    GdipBitmapUnlockBits: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.int32_t;
    };
    GdipDisposeImage: {
        args: FFIType.uint64_t[];
        returns: FFIType.int32_t;
    };
    GdipCreateBitmapFromScan0: {
        args: (FFIType.int32_t | FFIType.ptr)[];
        returns: FFIType.int32_t;
    };
    GdipSaveImageToFile: {
        args: (FFIType.uint64_t | FFIType.ptr)[];
        returns: FFIType.int32_t;
    };
    GdipGetImageEncodersSize: {
        args: FFIType.ptr[];
        returns: FFIType.int32_t;
    };
    GdipGetImageEncoders: {
        args: (FFIType.uint32_t | FFIType.ptr)[];
        returns: FFIType.int32_t;
    };
}>;
//# sourceMappingURL=ffi-loader.d.ts.map