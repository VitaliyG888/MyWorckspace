using System.Diagnostics;
using System.IO;
using System.Text.Json;
using System.Windows;
using System.Windows.Threading;

namespace TaskbarBannerApp;

public partial class MainWindow : Window
{
    readonly string dataPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "TaskbarBannerApp", "record.json");
    readonly DispatcherTimer timer = new() { Interval = TimeSpan.FromSeconds(1) };
    readonly DispatcherTimer taskbarTimer = new() { Interval = TimeSpan.FromSeconds(5) };
    OverlayWindow? overlay;
    bool taskbarHidden;
    LocalData data = new();
    EngineState state = EngineState.Blocked;
    int warmup, active, idle;
    public MainWindow()
    {
        InitializeComponent(); LoadData(); BannerToggle.IsChecked = data.BannerVisible; UpdateUi(); timer.Tick += Tick;
        taskbarTimer.Tick += (_, _) => RefreshTaskbar(); taskbarTimer.Start(); RefreshTaskbar();
    }
    void RefreshTaskbar()
    {
        bool hidden = TaskbarInterop.IsAutoHideEnabled();
        if (data.User is null) { overlay?.Hide(); return; }
        if (hidden) { overlay?.Hide(); taskbarHidden = true; state = EngineState.Blocked; timer.Stop(); StatusText.Text = "Taskbar auto-hide is enabled. Disable it to resume the timer."; return; }
        if (!data.BannerVisible) { overlay?.Hide(); timer.Stop(); state = EngineState.Blocked; StatusText.Text = "Banner is hidden. Turn on Show banner to resume the timer."; return; }
        overlay ??= new OverlayWindow(); overlay.Place(TaskbarInterop.GetTaskbarRect(), TaskbarInterop.GetTrayRect()); if (!overlay.IsVisible) overlay.Show();
        if (!timer.IsEnabled) { timer.Start(); if (taskbarHidden) { warmup = 0; active = 0; state = EngineState.WarmUp; taskbarHidden = false; } }
        UpdateUi();
    }
    void LoadData() { try { if (File.Exists(dataPath)) data = JsonSerializer.Deserialize<LocalData>(File.ReadAllText(dataPath)) ?? new(); } catch { data = new(); } }
    void Save() { Directory.CreateDirectory(Path.GetDirectoryName(dataPath)!); File.WriteAllText(dataPath, JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true })); }
    void Settings_Click(object sender, RoutedEventArgs e) { try { Process.Start(new ProcessStartInfo("ms-settings:taskbar") { UseShellExecute = true }); } catch { } }
    void BannerToggle_Click(object sender, RoutedEventArgs e)
    {
        data.BannerVisible = BannerToggle.IsChecked == true; Save();
        if (!data.BannerVisible) { overlay?.Hide(); timer.Stop(); state = EngineState.Blocked; UpdateUi(); }
        else { warmup = active = 0; state = EngineState.WarmUp; RefreshTaskbar(); }
    }
    void Register_Click(object sender, RoutedEventArgs e) { data.User = new UserRecord { UserId = Guid.NewGuid().ToString(), DeviceId = Environment.MachineName, DisplayName = "Demo User", CreatedUtc = DateTime.UtcNow, IsDemo = true }; Save(); RegisterButton.IsEnabled = false; timer.Start(); UpdateUi(); }
    void Tick(object? sender, EventArgs e)
    {
        if (data.User is null) return;
        if (TaskbarInterop.IsAutoHideEnabled() || !data.BannerVisible) { RefreshTaskbar(); return; }
        idle = (int)TaskbarInterop.GetIdleTime().TotalSeconds;
        if (idle >= 60) { Stop(StopReason.Idle60s, idle); state = EngineState.WarmUp; UpdateUi(); return; }
        warmup++;
        if (warmup >= 300) { state = EngineState.Counting; active++; if (active % 60 == 0) Save(); }
        UpdateUi();
    }
    void Stop(StopReason reason, int inactiveSeconds = 0) { state = EngineState.WarmUp; var preserved = Math.Max(0, active - Math.Min(active, inactiveSeconds)); if (preserved > 0) data.Runs.Add(new ActivityRun { StartUtc = DateTime.UtcNow.AddSeconds(-preserved), EndUtc = DateTime.UtcNow, WarmupSeconds = warmup, ActiveSeconds = preserved, StopReason = reason.ToString() }); warmup = active = 0; Save(); UpdateUi(); }
    void UpdateUi() { var total = data.Runs.Sum(r => r.ActiveSeconds) + active; RecordText.Text = $"Active record: {total:N0} seconds"; StatusText.Text = data.User is null ? "Demo mode — register a simulated user to display the banner." : state == EngineState.Counting ? "Counting active seconds • banner visible" : $"Registered demo user • Warm-up {warmup}/300 seconds"; RegisterButton.IsEnabled = data.User is null; }
}