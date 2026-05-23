CREATE TABLE `journal_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`entryType` enum('gratitude','scripture','prayer','moment') NOT NULL,
	`entryDate` varchar(10) NOT NULL,
	`text` text,
	`category` varchar(120),
	`reference` varchar(120),
	`verse` text,
	`note` text,
	`prayerKind` enum('Prayer Request','Question for the Holy Spirit'),
	`title` varchar(220),
	`details` text,
	`answered` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `journal_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `journal_entries` ADD CONSTRAINT `journal_entries_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;