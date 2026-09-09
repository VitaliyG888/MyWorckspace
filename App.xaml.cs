using System.Windows;
using System.Windows.Threading;

namespace TaskbarBannerApp;

public partial class App : Application
{
    Mutex? mutex;
    protected override void OnStartup(StartupEventArgs e)
    {
        mutex = new Mutex(true, "TaskbarBannerApp.SingleInstance", out var created);
        if (!created) { Shutdown(); return; }
        base.OnStartup(e);
        var window = new MainWindow();
        MainWindow = window;
        window.Show();
    }
    protected override void OnExit(ExitEventArgs e) { mutex?.ReleaseMutex(); mutex?.Dispose(); base.OnExit(e); }
}