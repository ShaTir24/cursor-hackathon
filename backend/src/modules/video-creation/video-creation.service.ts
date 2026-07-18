import {
  Injectable,
  MessageEvent,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { spawnAgent } from './cursor-cli';
import { CreateVideoDto } from './dto/create-video.dto';
import { createNextWorkspace } from './workspace.util';

@Injectable()
export class VideoCreationService {
  create(dto: CreateVideoDto): Observable<MessageEvent> {
    const apiKey = process.env.CURSOR_API_KEY?.trim();
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'CURSOR_API_KEY is not configured on the server',
      );
    }

    const workspace = createNextWorkspace(dto.username);

    return new Observable<MessageEvent>((subscriber) => {
      let child: Awaited<ReturnType<typeof spawnAgent>> | null = null;
      let stdoutBuf = '';
      let stderrBuf = '';
      let closed = false;

      const emitLine = (line: string, type?: string): void => {
        const trimmed = line.trim();
        if (!trimmed) return;
        if (type) {
          subscriber.next({ type, data: trimmed } as MessageEvent);
        } else {
          subscriber.next({ data: trimmed } as MessageEvent);
        }
      };

      void (async () => {
        try {
          child = await spawnAgent({
            prompt: dto.prompt,
            workspace,
            apiKey,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          subscriber.next({
            type: 'error',
            data: JSON.stringify({ message }),
          } as MessageEvent);
          subscriber.next({
            type: 'done',
            data: JSON.stringify({ exitCode: 1, workspace, error: message }),
          } as MessageEvent);
          subscriber.complete();
          return;
        }

        child.stdout?.on('data', (chunk: Buffer | string) => {
          stdoutBuf += typeof chunk === 'string' ? chunk : chunk.toString('utf8');
          const parts = stdoutBuf.split('\n');
          stdoutBuf = parts.pop() ?? '';
          for (const line of parts) {
            emitLine(line);
          }
        });

        child.stderr?.on('data', (chunk: Buffer | string) => {
          const text = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
          stderrBuf += text;
          const parts = stderrBuf.split('\n');
          stderrBuf = parts.pop() ?? '';
          for (const line of parts) {
            emitLine(line, 'error');
          }
        });

        child.once('error', (err) => {
          if (closed) return;
          closed = true;
          const message = err instanceof Error ? err.message : String(err);
          subscriber.next({
            type: 'error',
            data: JSON.stringify({ message }),
          } as MessageEvent);
          subscriber.next({
            type: 'done',
            data: JSON.stringify({ exitCode: 1, workspace, error: message }),
          } as MessageEvent);
          subscriber.complete();
        });

        child.once('close', (code, signal) => {
          if (closed) return;
          closed = true;
          if (stdoutBuf.trim()) emitLine(stdoutBuf);
          if (stderrBuf.trim()) emitLine(stderrBuf, 'error');
          subscriber.next({
            type: 'done',
            data: JSON.stringify({
              exitCode: code ?? 1,
              signal: signal ?? null,
              workspace,
            }),
          } as MessageEvent);
          subscriber.complete();
        });
      })();

      return () => {
        if (child && child.exitCode === null && !child.killed) {
          child.kill('SIGTERM');
        }
      };
    });
  }
}
