
import { SearchBar } from "../chirpstream/search-bar";
import { WhoToFollow } from "../chirpstream/who-to-follow";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

const newsItems = [
    { topic: "Space", title: "NASA discovers new planet in nearby galaxy", posts: "12.3k posts" },
    { topic: "Technology", title: "The new iPhone just dropped and it's controversial", posts: "45.1k posts" },
    { topic: "Politics", title: "New bill passes with bipartisan support", posts: "89.2k posts" },
]

export function RightSidebar() {
  return (
    <div className="sticky top-6 flex flex-col gap-6">
      <SearchBar />
      <Card className="bg-secondary/50 border-none">
        <CardHeader>
          <CardTitle>What's happening</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
            {newsItems.map((item, index) => (
                <div key={index}>
                    <p className="text-sm text-muted-foreground">{item.topic}</p>
                    <p className="font-bold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.posts}</p>
                </div>
            ))}
        </CardContent>
      </Card>
      <Card className="bg-secondary/50 border-none">
        <CardHeader>
          <CardTitle>Who to follow</CardTitle>
        </CardHeader>
        <CardContent>
          <WhoToFollow />
        </CardContent>
      </Card>
    </div>
  );
}
