using UnityEngine;
using UnityEditor;
using UnityEditor.Build.Reporting;
using System.IO;

public class BuildConfiguration
{
    [MenuItem("Build/Build All Platforms")]
    public static void BuildAllPlatforms()
    {
        BuildWindows();
        BuildMacOS();
        BuildLinux();
    }
    
    [MenuItem("Build/Build Windows")]
    public static void BuildWindows()
    {
        BuildPlayerOptions buildPlayerOptions = new BuildPlayerOptions();
        buildPlayerOptions.scenes = GetScenes();
        buildPlayerOptions.locationPathName = "Builds/Windows/BakerySimulator.exe";
        buildPlayerOptions.target = BuildTarget.StandaloneWindows64;
        buildPlayerOptions.options = BuildOptions.None;
        
        Debug.Log("開始構建 Windows 版本...");
        BuildReport report = BuildPipeline.BuildPlayer(buildPlayerOptions);
        BuildSummary summary = report.summary;
        
        if (summary.result == BuildResult.Succeeded)
        {
            Debug.Log($"Windows 構建成功: {summary.outputPath} ({summary.totalSize} bytes)");
        }
        else if (summary.result == BuildResult.Failed)
        {
            Debug.LogError("Windows 構建失敗");
        }
    }
    
    [MenuItem("Build/Build macOS")]
    public static void BuildMacOS()
    {
        BuildPlayerOptions buildPlayerOptions = new BuildPlayerOptions();
        buildPlayerOptions.scenes = GetScenes();
        buildPlayerOptions.locationPathName = "Builds/macOS/BakerySimulator.app";
        buildPlayerOptions.target = BuildTarget.StandaloneOSX;
        buildPlayerOptions.options = BuildOptions.None;
        
        Debug.Log("開始構建 macOS 版本...");
        BuildReport report = BuildPipeline.BuildPlayer(buildPlayerOptions);
        BuildSummary summary = report.summary;
        
        if (summary.result == BuildResult.Succeeded)
        {
            Debug.Log($"macOS 構建成功: {summary.outputPath}");
        }
        else if (summary.result == BuildResult.Failed)
        {
            Debug.LogError("macOS 構建失敗");
        }
    }
    
    [MenuItem("Build/Build Linux")]
    public static void BuildLinux()
    {
        BuildPlayerOptions buildPlayerOptions = new BuildPlayerOptions();
        buildPlayerOptions.scenes = GetScenes();
        buildPlayerOptions.locationPathName = "Builds/Linux/BakerySimulator";
        buildPlayerOptions.target = BuildTarget.StandaloneLinux64;
        buildPlayerOptions.options = BuildOptions.None;
        
        Debug.Log("開始構建 Linux 版本...");
        BuildReport report = BuildPipeline.BuildPlayer(buildPlayerOptions);
        BuildSummary summary = report.summary;
        
        if (summary.result == BuildResult.Succeeded)
        {
            Debug.Log($"Linux 構建成功: {summary.outputPath}");
        }
        else if (summary.result == BuildResult.Failed)
        {
            Debug.LogError("Linux 構建失敗");
        }
    }
    
    [MenuItem("Build/Build Steam Version")]
    public static void BuildSteamVersion()
    {
        // Steam 版本的特殊構建設置
        PlayerSettings.companyName = "BakerySimulatorStudio";
        PlayerSettings.productName = "Bakery Simulator";
        PlayerSettings.applicationIdentifier = "com.bakerysimulator.game";
        
        // 啟用 Steam 功能
        PlayerSettings.SetScriptingDefineSymbolsForGroup(BuildTargetGroup.Standalone, "STEAM_ENABLED");
        
        BuildWindows();
        
        Debug.Log("Steam 版本構建完成");
    }
    
    private static string[] GetScenes()
    {
        return new string[]
        {
            "Assets/Scenes/MainMenu.unity",
            "Assets/Scenes/MainGame.unity"
        };
    }
    
    [MenuItem("Build/Setup Build Environment")]
    public static void SetupBuildEnvironment()
    {
        // 創建構建目錄
        Directory.CreateDirectory("Builds/Windows");
        Directory.CreateDirectory("Builds/macOS");
        Directory.CreateDirectory("Builds/Linux");
        Directory.CreateDirectory("Builds/Steam");
        
        // 設置項目設定
        PlayerSettings.companyName = "BakerySimulatorStudio";
        PlayerSettings.productName = "麵包店模擬器";
        PlayerSettings.bundleVersion = "1.0.0";
        
        // 圖示設定
        // PlayerSettings.SetIconsForTargetGroup(BuildTargetGroup.Unknown, GetIcons());
        
        Debug.Log("構建環境設置完成");
    }
    
    [MenuItem("Build/Clean Build Folders")]
    public static void CleanBuildFolders()
    {
        if (Directory.Exists("Builds"))
        {
            Directory.Delete("Builds", true);
            Debug.Log("構建文件夾已清理");
        }
    }
} 