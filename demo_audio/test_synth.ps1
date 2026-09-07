Add-Type -AssemblyName System.Speech
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice.SetOutputToWaveFile("D:\Puneet\Swar\demo_audio\test_synth.wav")
$voice.Speak("Hello this is a speech test.")
$voice.Dispose()
