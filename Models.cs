namespace TaskbarBannerApp;

public enum EngineState { Blocked, WarmUp, Counting }
public enum StopReason { Idle60s, Lock, Sleep, AutoHide, BannerHidden, Manual }

public sealed class UserRecord
{
    public string UserId { get; set; } = "";
    public string DeviceId { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public DateTime CreatedUtc { get; set; }
    public bool IsDemo { get; set; }
}

public sealed class ActivityRun
{
    public DateTime StartUtc { get; set; }
    public DateTime? EndUtc { get; set; }
    public int WarmupSeconds { get; set; }
    public int ActiveSeconds { get; set; }
    public string StopReason { get; set; } = "";
}

public sealed class LocalData
{
    public UserRecord? User { get; set; }
    public List<ActivityRun> Runs { get; set; } = [];
    public bool BannerVisible { get; set; } = true;
}
