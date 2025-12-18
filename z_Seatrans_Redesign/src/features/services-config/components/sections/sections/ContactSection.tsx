import { LucideIcon, Phone, Mail } from 'lucide-react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'

export interface ContactPerson {
  name: string
  mobile: string
}

export interface ContactTeam {
  title: string
  icon: LucideIcon
  subtitle: string
  contacts: ContactPerson[]
  email: string
}

export interface StatItem {
  icon: LucideIcon
  value: string
  label: string
}

export function ContactSection({
  contacts
}: {
  contacts: {
    showEmergencyBadge?: boolean
    sectionTitle: string
    sectionDescription: string
    teams: ContactTeam[]
    stats?: StatItem[]
  }
}) {
  return (
    <section className="mb-16 md:mb-24">
      <div className="container">
        <div className="text-center mb-12">
          {contacts.showEmergencyBadge && (
            <Badge variant="destructive" className="mb-4">
              24/7 Emergency Support
            </Badge>
          )}
          <h2 className="fade-rise">{contacts.sectionTitle}</h2>
          <p
            className="text-muted-foreground mt-4 fade-rise max-w-2xl mx-auto"
            style={{ animationDelay: '90ms' }}
          >
            {contacts.sectionDescription}
          </p>
        </div>

        <div
          className={`grid gap-6 max-w-4xl mx-auto ${
            contacts.teams.length === 1 ? 'md:grid-cols-1' : 'md:grid-cols-2'
          }`}
        >
          {contacts.teams.map((team, index) => (
            <Card key={index} className="overflow-hidden hover-lift border-2 border-primary/20">
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <team.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-primary">{team.title}</h3>
                    <p className="text-sm text-muted-foreground">{team.subtitle}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {team.contacts.map((contact, contactIndex) => (
                    <div
                      key={contactIndex}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.mobile}</p>
                        </div>
                      </div>

                      <Button size="sm" variant="outline" asChild>
                        <a href={`tel:${contact.mobile.replace(/\./g, '')}`}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </a>
                      </Button>
                    </div>
                  ))}

                  <div className="pt-4 border-t">
                    <Button className="w-full" variant="default" asChild>
                      <a href={`mailto:${team.email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        {team.email}
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {contacts.stats && contacts.stats.length > 0 && (
          <div
            className={`grid gap-4 mt-8 max-w-4xl mx-auto ${
              contacts.stats.length === 2
                ? 'grid-cols-2'
                : contacts.stats.length === 3
                ? 'grid-cols-3'
                : 'grid-cols-2 md:grid-cols-4'
            }`}
          >
            {contacts.stats.map((stat, index) => (
              <div key={index} className="text-center p-4 rounded-lg bg-muted/20">
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="font-bold text-2xl">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
