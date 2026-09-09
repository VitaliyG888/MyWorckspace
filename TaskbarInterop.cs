using System.Runtime.InteropServices;
using System.Windows;

namespace TaskbarBannerApp;

public static class TaskbarInterop
{
    const int ABM_GETTASKBARPOS = 5, ABM_GETSTATE = 4, ABS_AUTOHIDE = 1;
    [StructLayout(LayoutKind.Sequential)] public struct Rect { public int Left, Top, Right, Bottom; }
    [StructLayout(LayoutKind.Sequential)] struct AppBarData { public int cbSize; public nint hWnd; public int uCallbackMessage; public int uEdge; public Rect rc; public nint lParam; }
    [DllImport("shell32.dll", SetLastError = true)] static extern uint SHAppBarMessage(uint msg, ref AppBarData data);
    [DllImport("user32.dll")] static extern nint FindWindow(string? cls, string? name);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern nint FindWindowEx(nint parent, nint child, string? cls, string? name);
    [DllImport("user32.dll")] static extern bool GetWindowRect(nint hWnd, out Rect rect);
    public static Rect GetTrayRect()
    {
        var taskbar = FindWindow("Shell_TrayWnd", null);
        var tray = FindWindowEx(taskbar, nint.Zero, "TrayNotifyWnd", null);
        return tray != nint.Zero && GetWindowRect(tray, out var rect) ? rect : GetTaskbarRect();
    }
    [StructLayout(LayoutKind.Sequential)] struct LastInputInfo { public uint cbSize; public uint dwTime; }
    [DllImport("user32.dll")] static extern bool GetLastInputInfo(ref LastInputInfo info);
    public static TimeSpan GetIdleTime()
    {
        var info = new LastInputInfo { cbSize = (uint)Marshal.SizeOf<LastInputInfo>() };
        if (!GetLastInputInfo(ref info)) return TimeSpan.MaxValue;
        var elapsed = unchecked((uint)Environment.TickCount - info.dwTime);
        return TimeSpan.FromMilliseconds(elapsed);
    }
    public static bool IsAutoHideEnabled()
    {
        var data = new AppBarData { cbSize = Marshal.SizeOf<AppBarData>() };
        return (SHAppBarMessage(ABM_GETSTATE, ref data) & ABS_AUTOHIDE) != 0;
    }
    public static Rect GetTaskbarRect()
    {
        var data = new AppBarData { cbSize = Marshal.SizeOf<AppBarData>(), hWnd = FindWindow("Shell_TrayWnd", null) };
        SHAppBarMessage(ABM_GETTASKBARPOS, ref data); return data.rc;
    }
}
