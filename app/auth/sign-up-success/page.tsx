import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome to AmbRadio Automation!</CardTitle>
              <CardDescription>Check your email to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                You&apos;ve successfully created your account. Please check your email to confirm your account and start
                managing your broadcasting platform.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
