using System.Windows;
using System.Windows.Interop;
using System.Runtime.InteropServices;

namespace TaskbarBannerApp;
public partial class OverlayWindow : Window
{
    public OverlayWindow() { InitializeComponent(); SourceInitialized += (_, _) => { var h = new WindowInteropHelper(this).Handle; Native.SetWindowLong(h, -20, Native.GetWindowLong(h, -20) | 0x08000000 | 0x00000080); }; }
    public void Place(TaskbarInterop.Rect taskbar, TaskbarInterop.Rect tray)
    {
        Height = Math.Max(1, taskbar.Bottom - taskbar.Top);
        Top = taskbar.Top;
        const double gap = 6;
        Left = Math.Max(taskbar.Left, tray.Left - Width - gap);
    }
    void Banner_Click(object sender, RoutedEventArgs e) { Application.Current.MainWindow?.Show(); Application.Current.MainWindow?.Activate(); }
    static class Native { [DllImport("user32.dll")] public static extern int GetWindowLong(nint h, int i); [DllImport("user32.dll")] public static extern int SetWindowLong(nint h, int i, int v); }
}