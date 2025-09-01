
"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function SettingsDisplayPage() {
    const [fontSize, setFontSize] = useState(16);

    const fontSteps = [12, 14, 16, 18, 20];
    const defaultValueIndex = 2;
    
    // Convert slider value (0-4) to font size
    const handleSliderChange = (value: number[]) => {
        const newSize = fontSteps[value[0]];
        setFontSize(newSize);
        document.documentElement.style.setProperty('--font-size-base', `${newSize}px`);
    };


    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Display</h3>
                <p className="text-sm text-muted-foreground">
                   Customize the appearance of the app.
                </p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Font Size</CardTitle>
                    <CardDescription>Adjust the font size for the application.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-8">
                       <Slider
                          defaultValue={[defaultValueIndex]}
                          min={0}
                          max={fontSteps.length - 1}
                          step={1}
                          onValueChange={handleSliderChange}
                          className="w-[200px]"
                        />
                         <div 
                            className="p-4 rounded-md border text-center text-sm bg-background"
                            style={{ fontSize: `${fontSize}px` }}
                        >
                           Aa
                        </div>
                    </div>
                     <div className="w-[200px] flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Small</span>
                        <span>Default</span>
                        <span>Large</span>
                    </div>
                    <div className="mt-6 border-t pt-6">
                        <p className="font-bold mb-2">Preview</p>
                        <div style={{ fontSize: `${fontSize}px`}} className="space-y-4 transition-all duration-200">
                             <h1 className="text-2xl font-bold">ChirpStream</h1>
                             <p>This is how the text will look with the selected font size. You can see how readable it is for you before applying it everywhere.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
